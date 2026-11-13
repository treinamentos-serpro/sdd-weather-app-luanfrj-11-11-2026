import { formatDateTime } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription } from '../lib/weatherCodes';
import type { HourlyForecast as HourlyForecastData, Unit } from '../types/weather';

interface HourlyForecastProps {
  forecast: HourlyForecastData[] | null;
  unit: Unit;
}

function formatMetric(value: number | null, unit: string): string {
  return value == null || !Number.isFinite(value)
    ? 'Dado indisponível'
    : `${value} ${unit}`;
}

export default function HourlyForecast({ forecast, unit }: HourlyForecastProps) {
  return (
    <section aria-labelledby="hourly-heading">
      <h2 id="hourly-heading" className="mb-4 text-xl font-semibold">
        Previsão por hora
      </h2>
      {forecast?.length ? (
        <div className="max-h-96 overflow-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="sticky top-0 bg-night-800 text-white/80">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Data e hora
                </th>
                <th scope="col" className="px-4 py-3">
                  Condição
                </th>
                <th scope="col" className="px-4 py-3">
                  Temperatura
                </th>
                <th scope="col" className="px-4 py-3">
                  Chance de chuva
                </th>
                <th scope="col" className="px-4 py-3">
                  Precipitação
                </th>
                <th scope="col" className="px-4 py-3">
                  Vento
                </th>
              </tr>
            </thead>
            <tbody>
              {forecast.slice(0, 120).map((hour) => {
                const weather = getWeatherDescription(hour.weatherCode);
                return (
                  <tr key={hour.time} className="border-t border-white/10">
                    <th scope="row" className="px-4 py-3 font-medium">
                      {formatDateTime(hour.time)}
                    </th>
                    <td className="px-4 py-3">
                      <span aria-hidden="true">{weather.icon} </span>
                      {weather.description}
                    </td>
                    <td className="px-4 py-3">{formatTemperature(hour.temperatureC, unit)}</td>
                    <td className="px-4 py-3">
                      {formatMetric(hour.precipitationProbabilityPercent, '%')}
                    </td>
                    <td className="px-4 py-3">{formatMetric(hour.precipitationMm, 'mm')}</td>
                    <td className="px-4 py-3">{formatMetric(hour.windSpeedKmh, 'km/h')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Dado indisponível</p>
      )}
    </section>
  );
}
