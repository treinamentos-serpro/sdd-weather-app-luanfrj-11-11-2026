import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  roundTemperature,
} from '../../src/lib/temperature';
import { getWeatherDescription } from '../../src/lib/weatherCodes';
import { mockWeatherData } from '../../src/mocks/weather';
import type { Unit } from '../../src/types/weather';

afterEach(cleanup);

describe('CurrentWeather', () => {
  it('atualiza 0 °C para 32 °F ao selecionar Fahrenheit', async () => {
    function WeatherWithUnitToggle() {
      const [unit, setUnit] = useState<Unit>('celsius');

      return (
        <>
          <UnitToggle unit={unit} onChange={setUnit} />
          <CurrentWeather
            city={mockWeatherData.city}
            current={{ ...mockWeatherData.current, temperatureC: 0 }}
            unit={unit}
          />
        </>
      );
    }

    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    const currentWeather = screen.getByRole('region', { name: 'Condições atuais' });
    expect(currentWeather).toHaveTextContent('0 °C');
    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(currentWeather).toHaveTextContent('32 °F');
  });

  it('exibe cidade, condição e métricas e converte as temperaturas', () => {
    const { city, current } = mockWeatherData;
    const { rerender } = render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getAllByText('24 °C')).toHaveLength(2);
    expect(screen.getByText('68 %')).toBeInTheDocument();
    expect(screen.getByText('12.5 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('920.4 hPa')).toBeInTheDocument();
    rerender(<CurrentWeather city={city} current={current} unit="fahrenheit" />);
    expect(screen.getByText('74 °F')).toBeInTheDocument();
    expect(screen.getByText('75 °F')).toBeInTheDocument();
    expect(screen.getByText('63 °F')).toBeInTheDocument();
  });

  it('exibe dados indisponíveis sem substituir valores nulos por zero', () => {
    const { city, current } = mockWeatherData;
    render(
      <CurrentWeather
        city={city}
        current={{
          ...current,
          temperatureC: Number.NaN,
          relativeHumidity: null,
          windSpeedKmh: Number.NaN,
          weatherCode: null,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getAllByText('Dado indisponível')).toHaveLength(4);
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|undefined/)).not.toBeInTheDocument();
  });
});

describe('funções meteorológicas', () => {
  it('converte temperaturas originais e arredonda metades para longe de zero', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(-40)).toBe(-40);
    expect(roundTemperature(celsiusToFahrenheit(21.6))).toBe(71);
    expect(fahrenheitToCelsius(32)).toBe(0);
    expect(roundTemperature(2.5)).toBe(3);
    expect(roundTemperature(-2.5)).toBe(-3);
  });

  it('mapeia todos os códigos previstos e usa o mesmo fallback para códigos ausentes ou desconhecidos', () => {
    const codes = [
      0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85,
      86, 95, 96, 99,
    ];
    for (const code of codes) {
      expect(getWeatherDescription(code).description).not.toBe('Dado indisponível');
      expect(getWeatherDescription(code).icon).toBeTruthy();
    }
    expect(getWeatherDescription(999)).toEqual(getWeatherDescription(null));
  });
});
