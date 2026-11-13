import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  CurrentConditions,
  DailyForecast,
  HourlyForecast,
  WeatherData,
} from '../../src/types/weather';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('mock meteorológico', () => {
  it('fornece dados completos e horários consecutivos sem acessar a rede', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    const { mockWeatherData } = await import('../../src/mocks/weather');
    const weather: WeatherData = mockWeatherData;

    expect(fetchMock).not.toHaveBeenCalled();
    expect(weather.city).toEqual({
      id: 3448439,
      name: 'São Paulo',
      country: 'Brasil',
      region: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.63611,
    });
    expect(weather.timezone).toBe('America/Sao_Paulo');

    const currentFields: (keyof CurrentConditions)[] = [
      'time',
      'temperatureC',
      'apparentTemperatureC',
      'relativeHumidity',
      'dewPointC',
      'pressureHpa',
      'windSpeedKmh',
      'windDirectionDegrees',
      'windGustsKmh',
      'precipitationMm',
      'cloudCoverPercent',
      'uvIndex',
      'visibilityKm',
      'weatherCode',
    ];
    const dailyFields: (keyof DailyForecast)[] = [
      'date',
      'temperatureMinC',
      'temperatureMaxC',
      'weatherCode',
      'precipitationProbabilityMaxPercent',
      'precipitationSumMm',
      'windSpeedMaxKmh',
      'windGustsMaxKmh',
      'windDirectionDominantDegrees',
      'uvIndexMax',
      'sunrise',
      'sunset',
    ];
    const hourlyFields: (keyof HourlyForecast)[] = [
      'time',
      'temperatureC',
      'precipitationProbabilityPercent',
      'precipitationMm',
      'windSpeedKmh',
      'weatherCode',
    ];

    expect(weather.current).not.toBeNull();
    for (const field of currentFields) expect(weather.current?.[field]).toBeDefined();
    for (const field of currentFields) expect(weather.current?.[field]).not.toBeNull();

    expect(weather.daily).toHaveLength(5);
    weather.daily?.forEach((day, index) => {
      expect(day.date).toBe(new Date(Date.UTC(2026, 10, 11 + index)).toISOString().slice(0, 10));
      for (const field of dailyFields) expect(day[field]).not.toBeNull();
      for (const field of dailyFields) expect(day[field]).toBeDefined();
    });

    expect(weather.hourly).toHaveLength(120);
    weather.hourly?.forEach((hour, index) => {
      expect(hour.time).toBe(
        new Date(Date.UTC(2026, 10, 11, 10 + index)).toISOString().slice(0, 16),
      );
      for (const field of hourlyFields) expect(hour[field]).not.toBeNull();
      for (const field of hourlyFields) expect(hour[field]).toBeDefined();
    });
    expect(weather.hourly?.[0].time).toBe(`${weather.current?.time.slice(0, 13)}:00`);
  });
});
