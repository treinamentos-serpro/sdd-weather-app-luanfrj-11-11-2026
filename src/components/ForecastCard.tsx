import { formatDay, formatTime } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function formatMetric(value: number | null, unit: string): string {
  return value == null || !Number.isFinite(value)
    ? 'Dado indisponível'
    : `${value}${unit ? ` ${unit}` : ''}`;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const weather = getWeatherDescription(day.weatherCode);
  const metrics = [
    { label: 'Máxima', value: formatTemperature(day.temperatureMaxC, unit) },
    { label: 'Mínima', value: formatTemperature(day.temperatureMinC, unit) },
    { label: 'Chance de chuva', value: formatMetric(day.precipitationProbabilityMaxPercent, '%') },
    { label: 'Precipitação', value: formatMetric(day.precipitationSumMm, 'mm') },
    { label: 'Vento máximo', value: formatMetric(day.windSpeedMaxKmh, 'km/h') },
    { label: 'Rajadas máximas', value: formatMetric(day.windGustsMaxKmh, 'km/h') },
    { label: 'Direção do vento', value: formatMetric(day.windDirectionDominantDegrees, '°') },
    { label: 'Índice UV máximo', value: formatMetric(day.uvIndexMax, '') },
    { label: 'Nascer do sol', value: formatTime(day.sunrise) },
    { label: 'Pôr do sol', value: formatTime(day.sunset) },
  ];

  return (
    <article className="min-w-0 rounded-lg border border-white/10 bg-white/5 p-4 text-white backdrop-blur-md">
      <h3 className="break-words text-sm font-semibold capitalize">{formatDay(day.date)}</h3>
      <div className="mt-4 flex min-h-12 items-center gap-3">
        <span aria-hidden="true" className="text-3xl">
          {weather.icon}
        </span>
        <p className="min-w-0 break-words text-sm text-white/80">{weather.description}</p>
      </div>
      <dl className="mt-4 space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0">
            <dt className="text-xs text-white/70">{metric.label}</dt>
            <dd className="break-words text-sm font-medium">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
