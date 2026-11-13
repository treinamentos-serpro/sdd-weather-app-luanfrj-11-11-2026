import type { TemperatureUnit } from '../types/weather';

export function celsiusToFahrenheit(temperatureC: number): number {
  return (temperatureC * 9) / 5 + 32;
}

export function fahrenheitToCelsius(temperatureF: number): number {
  return ((temperatureF - 32) * 5) / 9;
}

export function roundTemperature(temperature: number): number {
  return Math.sign(temperature) * Math.round(Math.abs(temperature));
}

export function convertTemperature(temperatureC: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? celsiusToFahrenheit(temperatureC) : temperatureC;
}

export function unitLabel(unit: TemperatureUnit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(
  temperatureC: number | null | undefined,
  unit: TemperatureUnit,
): string {
  if (temperatureC == null || !Number.isFinite(temperatureC)) return 'Dado indisponível';
  return `${roundTemperature(convertTemperature(temperatureC, unit))} ${unitLabel(unit)}`;
}
