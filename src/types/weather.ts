export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type Unit = TemperatureUnit;

export interface City {
  id?: number;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentConditions {
  time: string;
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  relativeHumidity: number | null;
  dewPointC: number | null;
  pressureHpa: number | null;
  windSpeedKmh: number | null;
  windDirectionDegrees: number | null;
  windGustsKmh: number | null;
  precipitationMm: number | null;
  cloudCoverPercent: number | null;
  uvIndex: number | null;
  visibilityKm: number | null;
  weatherCode: number | null;
}

export type CurrentWeather = CurrentConditions;

export interface DailyForecast {
  date: string;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  weatherCode: number | null;
  precipitationProbabilityMaxPercent: number | null;
  precipitationSumMm: number | null;
  windSpeedMaxKmh: number | null;
  windGustsMaxKmh: number | null;
  windDirectionDominantDegrees: number | null;
  uvIndexMax: number | null;
  sunrise: string | null;
  sunset: string | null;
}

export type ForecastDay = DailyForecast;

export interface HourlyForecast {
  time: string;
  temperatureC: number | null;
  precipitationProbabilityPercent: number | null;
  precipitationMm: number | null;
  windSpeedKmh: number | null;
  weatherCode: number | null;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentConditions | null;
  daily: DailyForecast[] | null;
  hourly: HourlyForecast[] | null;
}
