import type { Ref } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription } from '../lib/weatherCodes';
import type { City, CurrentConditions, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentConditions | null;
  unit: Unit;
  headingRef?: Ref<HTMLHeadingElement>;
}

function formatMetric(value: number | null | undefined, unit: string): string {
  return value == null || !Number.isFinite(value)
    ? 'Dado indisponível'
    : `${value}${unit ? ` ${unit}` : ''}`;
}

export default function CurrentWeather({ city, current, unit, headingRef }: CurrentWeatherProps) {
  const weather = getWeatherDescription(current?.weatherCode ?? null);
  const metrics = [
    {
      label: 'Sensação térmica',
      value: formatTemperature(current?.apparentTemperatureC ?? null, unit),
    },
    { label: 'Umidade', value: formatMetric(current?.relativeHumidity, '%') },
    { label: 'Vento', value: formatMetric(current?.windSpeedKmh, 'km/h') },
    { label: 'Direção do vento', value: formatMetric(current?.windDirectionDegrees, '°') },
    { label: 'Rajadas', value: formatMetric(current?.windGustsKmh, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current?.precipitationMm, 'mm') },
    { label: 'Pressão', value: formatMetric(current?.pressureHpa, 'hPa') },
    { label: 'Ponto de orvalho', value: formatTemperature(current?.dewPointC ?? null, unit) },
    { label: 'Cobertura de nuvens', value: formatMetric(current?.cloudCoverPercent, '%') },
    { label: 'Índice UV', value: formatMetric(current?.uvIndex, '') },
    { label: 'Visibilidade', value: formatMetric(current?.visibilityKm, 'km') },
  ];

  return (
    <section aria-label="Condições atuais" className="w-full text-white">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div className="min-w-0">
          <h2
            ref={headingRef}
            tabIndex={headingRef ? -1 : undefined}
            className="break-words text-2xl font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-400"
          >
            {city.name}
          </h2>
          <p className="mt-1 break-words text-sm text-white/70">
            {[city.region, city.country].filter(Boolean).join(', ')}
          </p>
          <p
            className={`mt-5 font-semibold ${current?.temperatureC == null ? 'text-2xl' : 'text-5xl sm:text-6xl'}`}
          >
            {formatTemperature(current?.temperatureC ?? null, unit)}
          </p>
          <p className="mt-2 text-lg text-white/80">{weather.description}</p>
        </div>
        <span aria-hidden="true" className="text-6xl sm:text-7xl">
          {weather.icon}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 pt-6 sm:grid-cols-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0">
            <dt className="text-sm text-white/70">{metric.label}</dt>
            <dd className="mt-1 break-words font-medium">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
