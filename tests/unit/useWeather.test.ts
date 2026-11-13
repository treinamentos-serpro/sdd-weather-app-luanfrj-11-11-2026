import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city = mockWeatherData.city;
const otherCity: City = { name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35 };
const offlineError = Object.assign(new Error('Failed to fetch'), { kind: 'network' });
const timeoutError = Object.assign(new Error('Timeout'), { kind: 'timeout' });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useWeather', () => {
  it('inicia vazio e busca o clima da primeira cidade', async () => {
    vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());
    expect(result.current).toMatchObject({ status: 'idle', data: null, cities: [], error: null, query: '' });

    let pending: Promise<void>;
    act(() => { pending = result.current.search('Sao Paulo'); });
    expect(result.current.status).toBe('loading');
    await act(async () => { await pending; });
    expect(searchCities).toHaveBeenCalledWith('Sao Paulo');
    expect(getWeather).toHaveBeenCalledWith(city);
    expect(result.current).toMatchObject({
      status: 'success', data: mockWeatherData, cities: [city, otherCity], error: null, query: 'Sao Paulo',
    });
  });

  it('informa resultado vazio sem buscar clima', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());
    await act(async () => { await result.current.search('Manaus'); });
    expect(result.current).toMatchObject({ status: 'empty', data: null, cities: [], query: 'Manaus' });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('informa falha offline na busca e repete o mesmo termo', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(offlineError)
      .mockResolvedValueOnce([]);
    const { result } = renderHook(() => useWeather());
    await act(async () => { await result.current.search('Paris'); });
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Não foi possível buscar cidades. Tente novamente.',
      query: 'Paris',
    });
    await act(async () => { await result.current.retry(); });
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenLastCalledWith('Paris');
    expect(result.current).toMatchObject({ status: 'empty', error: null });
  });

  it('informa falha offline do clima e repete apenas a cidade selecionada', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(offlineError)
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());
    await act(async () => { await result.current.search('Sao Paulo'); });
    expect(result.current).toMatchObject({
      status: 'error',
      cities: [city],
      error: 'Não foi possível carregar os dados. Tente novamente.',
    });
    await act(async () => { await result.current.retry(); });
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(city);
    expect(result.current).toMatchObject({ status: 'success', data: mockWeatherData, error: null });
  });

  it('mostra mensagem clara para timeout sem repetir automaticamente', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => { await result.current.search('Sao Paulo'); });
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'A consulta demorou mais que o esperado. Tente novamente.',
    });
    expect(getWeather).toHaveBeenCalledOnce();

    await act(async () => { await result.current.retry(); });
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(city);
    expect(result.current.status).toBe('success');
  });

  it('mantém a cidade e permite nova tentativa quando o retry também falha', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('Falha inicial'))
      .mockRejectedValueOnce(new Error('Falha na nova tentativa'))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => { await result.current.search('Sao Paulo'); });
    await act(async () => { await result.current.retry(); });
    expect(result.current).toMatchObject({
      status: 'error',
      cities: [city],
      data: null,
      error: 'Não foi possível carregar os dados. Tente novamente.',
    });
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);

    await act(async () => { await result.current.retry(); });
    expect(getWeather).toHaveBeenCalledTimes(3);
    expect(result.current).toMatchObject({ status: 'success', data: mockWeatherData, error: null });
  });

  it('seleciona outra cidade e limpa os dados anteriores durante o carregamento', async () => {
    vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
    let resolveWeather: (value: WeatherData) => void = () => {};
    vi.mocked(getWeather).mockResolvedValueOnce(mockWeatherData).mockImplementationOnce(
      () => new Promise((resolve) => { resolveWeather = resolve; }),
    );
    const { result } = renderHook(() => useWeather());
    await act(async () => { await result.current.search('Sao Paulo'); });
    let pending: Promise<void>;
    act(() => { pending = result.current.selectCity(otherCity); });
    expect(result.current).toMatchObject({ status: 'loading', data: null, cities: [city, otherCity] });
    await act(async () => { resolveWeather({ ...mockWeatherData, city: otherCity }); await pending; });
    expect(result.current).toMatchObject({ status: 'success', data: { city: otherCity } });
  });

  it('ignora respostas de buscas anteriores', async () => {
    let resolveSearch: (value: City[]) => void = () => {};
    vi.mocked(searchCities).mockImplementationOnce(() => new Promise((resolve) => { resolveSearch = resolve; }));
    vi.mocked(searchCities).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useWeather());
    let first: Promise<void>;
    act(() => { first = result.current.search('Antiga'); });
    await act(async () => { await result.current.search('Nova'); });
    await act(async () => { resolveSearch([city]); await first; });
    expect(result.current).toMatchObject({ status: 'empty', query: 'Nova', cities: [] });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('ignora o clima de uma cidade selecionada anteriormente', async () => {
    let resolveWeather: (value: WeatherData) => void = () => {};
    vi.mocked(getWeather).mockImplementationOnce(() => new Promise((resolve) => { resolveWeather = resolve; }));
    vi.mocked(getWeather).mockResolvedValueOnce({ ...mockWeatherData, city: otherCity });
    const { result } = renderHook(() => useWeather());
    let first: Promise<void>;
    act(() => { first = result.current.selectCity(city); });
    await act(async () => { await result.current.selectCity(otherCity); });
    await act(async () => { resolveWeather(mockWeatherData); await first; });
    expect(result.current).toMatchObject({ status: 'success', data: { city: otherCity } });
  });
});