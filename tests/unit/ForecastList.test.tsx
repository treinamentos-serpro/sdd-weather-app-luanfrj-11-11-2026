import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { formatDay } from '../../src/lib/format';
import { mockWeatherData } from '../../src/mocks/weather';

afterEach(cleanup);

describe('ForecastList', () => {
  it('exibe cinco dias na ordem e converte as temperaturas ao mudar a unidade', () => {
    const forecast = [
      ...mockWeatherData.daily,
      { ...mockWeatherData.daily[4], date: '2026-11-16' },
    ];
    const { rerender } = render(<ForecastList forecast={forecast} unit="celsius" />);
    const cards = screen.getAllByRole('article');

    expect(cards).toHaveLength(5);
    expect(
      within(cards[0]).getByRole('heading', { name: /quarta-feira, 11\/11\/2026/i }),
    ).toBeInTheDocument();
    expect(
      within(cards[4]).getByRole('heading', { name: /domingo, 15\/11\/2026/i }),
    ).toBeInTheDocument();
    expect(within(cards[0]).getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(within(cards[0]).getByText('27 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('18 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('20 %')).toBeInTheDocument();
    expect(within(cards[0]).getByText('0.2 mm')).toBeInTheDocument();
    expect(within(cards[0]).getByText('05:15')).toBeInTheDocument();

    rerender(<ForecastList forecast={forecast} unit="fahrenheit" />);
    expect(within(cards[0]).getByText('81 °F')).toBeInTheDocument();
    expect(within(cards[0]).getByText('65 °F')).toBeInTheDocument();
  });

  it('preserva dados ausentes e valores zero', () => {
    const day = {
      ...mockWeatherData.daily[0],
      temperatureMaxC: null,
      weatherCode: null,
      precipitationProbabilityMaxPercent: 0,
      windSpeedMaxKmh: Number.NaN,
      sunrise: null,
      sunset: '',
    };
    render(<ForecastList forecast={[day]} unit="celsius" />);

    expect(screen.getAllByText('Dado indisponível')).toHaveLength(5);
    expect(screen.getByText('0 %')).toBeInTheDocument();
    expect(screen.getByText('18 °C')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|undefined/)).not.toBeInTheDocument();
  });

  it('informa quando a previsão está vazia ou indisponível', () => {
    const { rerender } = render(<ForecastList forecast={null} unit="celsius" />);
    expect(screen.getByText('Dado indisponível')).toBeInTheDocument();
    rerender(<ForecastList forecast={[]} unit="celsius" />);
    expect(screen.getByText('Dado indisponível')).toBeInTheDocument();
  });

  it('formata datas locais sem deslocá-las pelo fuso do navegador', () => {
    expect(formatDay('2026-01-01')).toBe('quinta-feira, 01/01/2026');
  });
});
