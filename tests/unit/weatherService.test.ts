import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('searchCities', () => {
  it('ignora termos invalidos sem acessar a rede', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    for (const term of ['', '   ', 'a', 'a'.repeat(101)]) {
      expect(await searchCities(term)).toEqual([]);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o termo e mapeia os resultados na ordem recebida', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: 'S\u00e3o Paulo',
            country: 'Brasil',
            admin1: 'S\u00e3o Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
          { id: 2, name: 'Paulo', country: 'Brasil', latitude: 1, longitude: 2 },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    expect(await searchCities(' S\u00e3o Paulo ')).toEqual([
      {
        id: 1,
        name: 'S\u00e3o Paulo',
        country: 'Brasil',
        region: 'S\u00e3o Paulo',
        latitude: -23.55,
        longitude: -46.63,
      },
      { id: 2, name: 'Paulo', country: 'Brasil', region: undefined, latitude: 1, longitude: 2 },
    ]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo&count=10&language=pt&format=json',
      { signal: expect.any(AbortSignal) },
    );
  });

  it.each([{}, { results: [] }])('retorna lista vazia quando results está ausente ou vazio', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
    expect(await searchCities('Paris')).toEqual([]);
  });

  it('preserva acentos, espaços, hífens e apóstrofos no termo', async () => {
    const term = "L'Haÿ-les-Roses";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });
    vi.stubGlobal('fetch', fetchMock);

    await searchCities(term);

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('name')).toBe(term);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('lanca WeatherServiceError em resposta HTTP nao bem-sucedida', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetchMock);
    await expect(searchCities('Paris')).rejects.toBeInstanceOf(WeatherServiceError);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe.each([
  ['busca', () => searchCities('Paris')],
  ['previsao', () => getWeather({ name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35 })],
])('timeout e rede na %s', (_operation, request) => {
  it('interrompe a chamada após 5 segundos sem repetição automática', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, _options: { signal: AbortSignal }) =>
      new Promise(() => {}),
    );
    vi.stubGlobal('fetch', fetchMock);

    const pending = request();
    void pending.catch(() => {});
    await vi.advanceTimersByTimeAsync(5_000);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it('aborta apos 5 segundos e limpa o temporizador', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, options: { signal: AbortSignal }) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = request();
    const rejection = expect(result).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: 'A consulta demorou mais que o esperado. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(4_999);
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await rejection;
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('mantem o timeout ativo durante a leitura do JSON', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, options: { signal: AbortSignal }) =>
      Promise.resolve({
        ok: true,
        json: () => new Promise((_resolve, reject) => {
          options.signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const pending = request();
    const rejection = expect(pending).rejects.toMatchObject({ kind: 'timeout' });
    await vi.advanceTimersByTimeAsync(5_000);
    await rejection;
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('classifica rede offline e limpa o temporizador', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(request()).rejects.toMatchObject({
      name: 'WeatherServiceError', kind: 'network', message: 'Falha de rede.',
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('classifica JSON malformado como resposta invalida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => { throw new SyntaxError('Unexpected token'); },
    }));
    await expect(request()).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('limpa o temporizador quando fetch conclui', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(request()).rejects.toMatchObject({ name: 'WeatherServiceError', kind: 'api' });
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('getWeather', () => {
  const city = { name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35 };
  const dates = ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16'];
  const hourlyTimes = Array.from({ length: 120 }, (_, index) =>
    new Date(Date.UTC(2026, 10, 11, 14 + index)).toISOString().slice(0, 16),
  );
  const payload = {
    timezone: 'Europe/Paris',
    current: {
      time: '2026-11-11T14:00', temperature_2m: 24.3, apparent_temperature: 25.1,
      relative_humidity_2m: 68, dew_point_2m: 17.8, surface_pressure: 924.5,
      wind_speed_10m: 10.1, wind_direction_10m: 180, wind_gusts_10m: 16.2,
      precipitation: 0, cloud_cover: 40, uv_index: 5.2, visibility: 24000, weather_code: 2,
    },
    daily: {
      time: dates, temperature_2m_min: [1, 2, 3, 4, 5, 6],
      temperature_2m_max: [11, 12, 13, 14, 15, 16], weather_code: [0, 1, 2, 3, 45, 48],
      precipitation_probability_max: [10, 20, 30, 40, 50], precipitation_sum: [0, 1, 2, 3, 4],
      wind_speed_10m_max: [10, 11, 12, 13, 14], wind_gusts_10m_max: [20, 21, 22, 23, 24],
      wind_direction_10m_dominant: [90, 100, 110, 120, 130], uv_index_max: [1, 2, 3, 4, 5],
      sunrise: ['a', 'b', 'c', 'd', 'e'], sunset: ['f', 'g', 'h', 'i', 'j'],
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: Array.from({ length: 120 }, (_, index) => index === 0 ? 24.3 : null),
      precipitation_probability: Array(120).fill(20),
      precipitation: Array(120).fill(0),
      wind_speed_10m: Array(120).fill(10.1),
      weather_code: Array(120).fill(2),
    },
  };

  it('solicita e mapeia as condicoes atuais e cinco dias por indice', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal('fetch', fetchMock);
    const result = await getWeather(city);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('48.85');
    expect(url.searchParams.get('longitude')).toBe('2.35');
    expect(url.searchParams.get('current')).toContain('visibility');
    expect(url.searchParams.get('daily')).toContain('temperature_2m_min');
    expect(url.searchParams.get('hourly')).toBe(
      'temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code',
    );
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(result.city).toEqual(city);
    expect(result.timezone).toBe('Europe/Paris');
    expect(result.current).toEqual({
      time: '2026-11-11T14:00', temperatureC: 24.3, apparentTemperatureC: 25.1,
      relativeHumidity: 68, dewPointC: 17.8, pressureHpa: 924.5, windSpeedKmh: 10.1,
      windDirectionDegrees: 180, windGustsKmh: 16.2, precipitationMm: 0,
      cloudCoverPercent: 40, uvIndex: 5.2, visibilityKm: 24, weatherCode: 2,
    });
    expect(result.daily).toHaveLength(5);
    expect(result.daily?.[1]).toEqual({
      date: '2026-11-12', temperatureMinC: 2, temperatureMaxC: 12, weatherCode: 1,
      precipitationProbabilityMaxPercent: 20, precipitationSumMm: 1, windSpeedMaxKmh: 11,
      windGustsMaxKmh: 21, windDirectionDominantDegrees: 100, uvIndexMax: 2,
      sunrise: 'b', sunset: 'g',
    });
    expect(result.hourly).toHaveLength(120);
    expect(result.hourly?.[0]).toEqual({
      time: hourlyTimes[0],
      temperatureC: 24.3,
      precipitationProbabilityPercent: 20,
      precipitationMm: 0,
      windSpeedKmh: 10.1,
      weatherCode: 2,
    });
  });

  it('preserva valores ausentes como null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ timezone: 'UTC', current: { time: 'now' }, daily: { time: dates } }),
    }));
    const result = await getWeather(city);
    expect(result.current?.temperatureC).toBeNull();
    expect(result.current?.visibilityKm).toBeNull();
    expect(result.daily?.[0].temperatureMinC).toBeNull();
  });

  it('converte campos nulos, ausentes e não finitos em null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'UTC',
        current: { time: '2026-11-11T14:00', temperature_2m: Number.NaN, visibility: null },
        daily: { time: dates, temperature_2m_min: [null, 1] },
        hourly: { time: hourlyTimes, precipitation_probability: [Number.NaN, 0] },
      }),
    }));

    const result = await getWeather(city);
    expect(result.current?.temperatureC).toBeNull();
    expect(result.current?.apparentTemperatureC).toBeNull();
    expect(result.current?.visibilityKm).toBeNull();
    expect(result.daily?.[0].temperatureMinC).toBeNull();
    expect(result.daily?.[0].temperatureMaxC).toBeNull();
    expect(result.daily?.[0].sunrise).toBeNull();
    expect(result.hourly?.[0].temperatureC).toBeNull();
    expect(result.hourly?.[0].precipitationProbabilityPercent).toBeNull();
    expect(result.hourly?.[0].weatherCode).toBeNull();
  });

  it('mantem seções disponíveis quando a seção atual está ausente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...payload, current: null }),
    }));

    const result = await getWeather(city);
    expect(result.current).toBeNull();
    expect(result.daily).toHaveLength(5);
    expect(result.hourly).toHaveLength(120);
  });

  it('marca somente uma seção como indisponível quando falta seu eixo temporal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...payload, daily: { temperature_2m_min: [1, 2] } }),
    }));

    const result = await getWeather(city);
    expect(result.current?.temperatureC).toBe(24.3);
    expect(result.daily).toBeNull();
    expect(result.hourly).toHaveLength(120);
  });

  it('preserva precipitação nula e zero na resposta parcial sem descartar dados válidos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...payload,
        current: { ...payload.current, precipitation: null },
        daily: { ...payload.daily, precipitation_sum: [null, 0, 2, 3, 4] },
      }),
    }));

    const result = await getWeather(city);
    expect(result.current?.precipitationMm).toBeNull();
    expect(result.current?.temperatureC).toBe(24.3);
    expect(result.daily?.[0].precipitationSumMm).toBeNull();
    expect(result.daily?.[1].precipitationSumMm).toBe(0);
    expect(result.daily?.[2].precipitationSumMm).toBe(2);
  });

  it('preserva precipitacao atual null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...payload, current: { ...payload.current, precipitation: null } }),
    }));

    const result = await getWeather(city);
    expect(result.current?.precipitationMm).toBeNull();
  });

  it('rejeita resposta sem fuso horario', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: payload.current, daily: payload.daily }),
    }));
    const result = getWeather(city);
    await expect(result).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(result).rejects.toMatchObject({
      name: 'WeatherServiceError', kind: 'invalid-response',
    });
  });

  it('rejeita resposta HTTP nao bem-sucedida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});