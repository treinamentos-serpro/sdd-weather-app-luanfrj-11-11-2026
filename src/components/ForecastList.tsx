import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[] | null;
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="w-full text-white">
      <h2 id="forecast-heading" className="mb-4 text-xl font-semibold">
        Previsão para 5 dias
      </h2>
      {forecast?.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.slice(0, 5).map((day) => (
            <ForecastCard key={day.date} day={day} unit={unit} />
          ))}
        </div>
      ) : (
        <p>Dado indisponível</p>
      )}
    </section>
  );
}
