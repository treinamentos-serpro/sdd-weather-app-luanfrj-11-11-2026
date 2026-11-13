import type { City, WeatherData } from '../types/weather';

interface GeocodingResult {
  id?: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  timezone: string;
  current?: unknown;
  daily?: unknown;
  hourly?: unknown;
}

const REQUEST_TIMEOUT_MS = 5_000;

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly kind: 'api' | 'invalid-response' | 'network' | 'timeout' = 'api',
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  if (!isRecord(value)) return false;
  return (
    (value.id === undefined || typeof value.id === 'number') &&
    typeof value.name === 'string' &&
    typeof value.country === 'string' &&
    (value.admin1 === undefined || typeof value.admin1 === 'string') &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude)
  );
}

function isForecastResponse(value: unknown): value is ForecastResponse {
  return isRecord(value) && typeof value.timezone === 'string';
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  return finiteNumber(record[key]);
}

function readArrayNumber(
  record: Record<string, unknown>,
  key: string,
  index: number,
): number | null {
  const values = record[key];
  return Array.isArray(values) ? finiteNumber(values[index]) : null;
}

function readArrayString(
  record: Record<string, unknown>,
  key: string,
  index: number,
): string | null {
  const values = record[key];
  const value = Array.isArray(values) ? values[index] : null;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4}-\d{2}-\d{2})T(?:[01]\d|2[0-3]):[0-5]\d$/.exec(value);
  return match !== null && isValidDate(match[1]);
}

function readTimeAxis(
  record: Record<string, unknown> | null,
  requiredCount: number,
  isValid: (value: unknown) => value is string,
): string[] | null {
  const values = record?.time;
  if (!Array.isArray(values) || values.length < requiredCount) return null;
  const times = values.slice(0, requiredCount);
  return times.every(isValid) ? times : null;
}

function mapCurrent(value: unknown): WeatherData['current'] {
  if (!isRecord(value) || typeof value.time !== 'string' || value.time.length === 0) return null;
  const visibility = readNumber(value, 'visibility');
  return {
    time: value.time,
    temperatureC: readNumber(value, 'temperature_2m'),
    apparentTemperatureC: readNumber(value, 'apparent_temperature'),
    relativeHumidity: readNumber(value, 'relative_humidity_2m'),
    dewPointC: readNumber(value, 'dew_point_2m'),
    pressureHpa: readNumber(value, 'surface_pressure'),
    windSpeedKmh: readNumber(value, 'wind_speed_10m'),
    windDirectionDegrees: readNumber(value, 'wind_direction_10m'),
    windGustsKmh: readNumber(value, 'wind_gusts_10m'),
    precipitationMm: readNumber(value, 'precipitation'),
    cloudCoverPercent: readNumber(value, 'cloud_cover'),
    uvIndex: readNumber(value, 'uv_index'),
    visibilityKm: visibility === null ? null : visibility / 1000,
    weatherCode: readNumber(value, 'weather_code'),
  };
}

function mapDaily(value: unknown): WeatherData['daily'] {
  if (!isRecord(value)) return null;
  const dates = readTimeAxis(value, 5, isValidDate);
  if (!dates) return null;
  return dates.map((date, index) => ({
    date,
    temperatureMinC: readArrayNumber(value, 'temperature_2m_min', index),
    temperatureMaxC: readArrayNumber(value, 'temperature_2m_max', index),
    weatherCode: readArrayNumber(value, 'weather_code', index),
    precipitationProbabilityMaxPercent: readArrayNumber(value, 'precipitation_probability_max', index),
    precipitationSumMm: readArrayNumber(value, 'precipitation_sum', index),
    windSpeedMaxKmh: readArrayNumber(value, 'wind_speed_10m_max', index),
    windGustsMaxKmh: readArrayNumber(value, 'wind_gusts_10m_max', index),
    windDirectionDominantDegrees: readArrayNumber(value, 'wind_direction_10m_dominant', index),
    uvIndexMax: readArrayNumber(value, 'uv_index_max', index),
    sunrise: readArrayString(value, 'sunrise', index),
    sunset: readArrayString(value, 'sunset', index),
  }));
}

function mapHourly(value: unknown): WeatherData['hourly'] {
  if (!isRecord(value)) return null;
  const times = readTimeAxis(value, 120, isValidDateTime);
  if (!times) return null;
  return times.map((time, index) => ({
    time,
    temperatureC: readArrayNumber(value, 'temperature_2m', index),
    precipitationProbabilityPercent: readArrayNumber(value, 'precipitation_probability', index),
    precipitationMm: readArrayNumber(value, 'precipitation', index),
    windSpeedKmh: readArrayNumber(value, 'wind_speed_10m', index),
    weatherCode: readArrayNumber(value, 'weather_code', index),
  }));
}

async function fetchJsonWithTimeout(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherServiceError(`Falha HTTP ${response.status}.`, 'api');
    }
    return await response.json();
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (controller.signal.aborted || (isRecord(error) && error.name === 'AbortError')) {
      throw new WeatherServiceError(
        'A consulta demorou mais que o esperado. Tente novamente.',
        'timeout',
      );
    }
    if (error instanceof SyntaxError) {
      throw new WeatherServiceError('Resposta inválida do serviço meteorológico.', 'invalid-response');
    }
    throw new WeatherServiceError('Falha de rede.', 'network');
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const term = name.trim();
  if (term.length < 2 || term.length > 100) return [];

  const data = await fetchJsonWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=10&language=pt&format=json`,
  );

  if (!isRecord(data) || (data.results !== undefined && !Array.isArray(data.results))) {
    throw new WeatherServiceError('Resposta inválida do serviço de busca.', 'invalid-response');
  }
  const results = (data as GeocodingResponse).results ?? [];
  if (!results.every(isGeocodingResult)) {
    throw new WeatherServiceError('Resposta inválida do serviço de busca.', 'invalid-response');
  }
  return results.map(({ id, name, country, admin1, latitude, longitude }) => ({
    id,
    name,
    country,
    region: admin1,
    latitude,
    longitude,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,cloud_cover,uv_index,visibility,weather_code',
    daily: 'temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset',
    hourly: 'temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    forecast_days: '6',
  });
  const data = await fetchJsonWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!isForecastResponse(data)) {
    throw new WeatherServiceError('Resposta meteorológica inválida.', 'invalid-response');
  }

  return {
    city,
    timezone: data.timezone,
    current: mapCurrent(data.current),
    daily: mapDaily(data.daily),
    hourly: mapHourly(data.hourly),
  };
}