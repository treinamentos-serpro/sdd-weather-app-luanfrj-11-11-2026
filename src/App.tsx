import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import HourlyForecast from './components/HourlyForecast';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, search, retry } = useWeather();
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === 'success') resultHeadingRef.current?.focus();
  }, [status]);

  return (
    <div className="min-h-screen bg-night-900 font-sans text-white">
      <header className="border-b border-white/10 bg-night-800/80 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8 lg:px-8">
          <div>
            <p className="text-lg font-bold">SERPRO</p>
            <h1 className="text-sm text-white/70">Previsão do tempo</h1>
          </div>
          <div className="col-span-2 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <SearchBar onSearch={search} />
          </div>
          <div className="col-start-2 row-start-1 lg:col-start-3">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {status === 'loading' && <LoadingState />}
        <div aria-busy={status === 'loading'}>
          {status === 'idle' && (
            <p role="status">Informe o nome de uma cidade para ver o clima.</p>
          )}
          {status === 'empty' && <EmptyState />}
          {status === 'error' && (
            <ErrorState
              message={error ?? 'Não foi possível carregar os dados. Tente novamente.'}
              onRetry={retry}
            />
          )}
          {status === 'success' && data && (
            <div className="space-y-12">
              <CurrentWeather
                city={data.city}
                current={data.current}
                unit={unit}
                headingRef={resultHeadingRef}
              />
              <div>
                <ForecastList forecast={data.daily} unit={unit} />
                <p className="mt-5 text-sm text-white/70">
                  A previsão é uma estimativa e não substitui alertas oficiais.
                </p>
              </div>
              <HourlyForecast forecast={data.hourly} unit={unit} />
            </div>
          )}
        </div>
      </main>
      <footer className="mx-auto max-w-7xl border-t border-white/10 px-4 py-6 text-sm text-white/70 sm:px-6 lg:px-8">
        Dados meteorológicos: Open-Meteo ·{' '}
        <a
          className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
          href="https://creativecommons.org/licenses/by/4.0/"
        >
          Licença CC BY 4.0
        </a>
      </footer>
    </div>
  );
}
