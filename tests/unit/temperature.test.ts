import { describe, expect, it } from 'vitest';
import {
  celsiusToFahrenheit,
  convertTemperature,
  formatTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('temperature utilities', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %i °C to %i °F', (celsius, fahrenheit) => {
    expect(celsiusToFahrenheit(celsius)).toBe(fahrenheit);
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('keeps Celsius values and converts Fahrenheit values by unit', () => {
    expect(convertTemperature(21.6, 'celsius')).toBe(21.6);
    expect(convertTemperature(21.6, 'fahrenheit')).toBeCloseTo(70.88);
  });

  it('formats the rounded value with the matching unit symbol', () => {
    expect(formatTemperature(21.6, 'celsius')).toBe('22 °C');
    expect(formatTemperature(21.6, 'fahrenheit')).toBe('71 °F');
  });

  it.each([
    [-40, '-40 °F'],
    [0, '32 °F'],
    [21.6, '71 °F'],
    [100, '212 °F'],
  ])('formata %s °C como %s sem arredondar antes da conversão', (celsius, expected) => {
    expect(formatTemperature(celsius, 'fahrenheit')).toBe(expected);
  });

  it('returns the unavailable label for a null value', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Dado indisponível');
  });

  it('returns the symbol for each unit', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});