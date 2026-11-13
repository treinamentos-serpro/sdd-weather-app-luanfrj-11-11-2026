import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';
type LastOperation = { type: 'search'; name: string } | { type: 'weather'; city: City };

export function useWeather() {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  useEffect(() => () => { requestId.current += 1; }, []);

  function getErrorMessage(caught: unknown, operation: LastOperation['type']): string {
    if (caught instanceof Error && 'kind' in caught && caught.kind === 'timeout') {
      return 'A consulta demorou mais que o esperado. Tente novamente.';
    }
    return operation === 'search'
      ? 'Não foi possível buscar cidades. Tente novamente.'
      : 'Não foi possível carregar os dados. Tente novamente.';
  }

  function handleError(caught: unknown, currentRequest: number, operation: LastOperation['type']) {
    if (currentRequest !== requestId.current) return;
    setError(getErrorMessage(caught, operation));
    setStatus('error');
  }

  async function loadWeather(city: City, currentRequest: number) {
    lastOperation.current = { type: 'weather', city };
    try {
      const weather = await getWeather(city);
      if (currentRequest !== requestId.current) return;
      setData(weather);
      setStatus('success');
    } catch (caught) {
      handleError(caught, currentRequest, 'weather');
    }
  }

  async function search(name: string) {
    const currentRequest = ++requestId.current;
    lastOperation.current = { type: 'search', name };
    setQuery(name);
    setStatus('loading');
    setData(null);
    setCities([]);
    setError(null);

    let results: City[];
    try {
      results = await searchCities(name);
    } catch (caught) {
      handleError(caught, currentRequest, 'search');
      return;
    }
    if (currentRequest !== requestId.current) return;
    setCities(results);
    if (results.length === 0) {
      setStatus('empty');
      return;
    }
    await loadWeather(results[0], currentRequest);
  }

  async function selectCity(city: City) {
    const currentRequest = ++requestId.current;
    setStatus('loading');
    setData(null);
    setError(null);

    await loadWeather(city, currentRequest);
  }

  async function retry() {
    const operation = lastOperation.current;
    if (!operation) return;
    if (operation.type === 'search') await search(operation.name);
    else await selectCity(operation.city);
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}