import { describe, expect, it } from 'vitest';
import { getWeatherDescription } from '../../src/lib/weatherCodes';

describe('getWeatherDescription', () => {
  it('retorna descrição e ícone para um código conhecido', () => {
    expect(getWeatherDescription(0)).toEqual({ description: 'Céu limpo', icon: '☀️' });
  });

  it('usa o fallback para um código desconhecido', () => {
    expect(getWeatherDescription(999)).toEqual({
      description: 'Dado indisponível',
      icon: '❔',
    });
  });
});