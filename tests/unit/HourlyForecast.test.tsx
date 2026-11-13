import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import HourlyForecast from '../../src/components/HourlyForecast';

afterEach(cleanup);

describe('HourlyForecast', () => {
  it('mostra fallback para campos ausentes ou não finitos sem exibir NaN', () => {
    render(
      <HourlyForecast
        forecast={[
          {
            time: '2026-11-11T14:00',
            temperatureC: null,
            precipitationProbabilityPercent: null,
            precipitationMm: Number.NaN,
            windSpeedKmh: null,
            weatherCode: null,
          },
        ]}
        unit="celsius"
      />,
    );

    const table = screen.getByRole('table');
    const row = within(table).getByRole('row', { name: /quarta-feira, 11\/11\/2026 14:00/i });
    expect(within(row).getAllByText('Dado indisponível')).toHaveLength(5);
    expect(row).not.toHaveTextContent(/NaN|undefined/);
  });

  it('mostra fallback quando a hora não pode ser formatada', () => {
    render(
      <HourlyForecast
        forecast={[
          {
            time: '',
            temperatureC: 20,
            precipitationProbabilityPercent: 0,
            precipitationMm: 0,
            windSpeedKmh: 2,
            weatherCode: 0,
          },
        ]}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('row', { name: /Dado indisponível/ })).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });
});