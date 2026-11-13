import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('App', () => {
  it('busca cidades, alterna unidades e informa buscas sem resultado', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValueOnce([mockWeatherData.city]).mockResolvedValueOnce([]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);

    expect(screen.getByText('Informe o nome de uma cidade para ver o clima.')).toBeInTheDocument();
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'sao paulo{Enter}');
    const resultHeading = await screen.findByRole('heading', { name: 'São Paulo' });
    expect(resultHeading).toBeInTheDocument();
    expect(resultHeading).toHaveFocus();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    const current = screen.getByRole('region', { name: 'Condições atuais' });
    expect(within(current).getAllByText('24 °C')).toHaveLength(2);
    const hourly = screen.getByRole('region', { name: 'Previsão por hora' });
    expect(within(hourly).getAllByRole('row')).toHaveLength(121);
    expect(within(hourly).getAllByText('24 °C')).toHaveLength(120);
    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(within(current).getByText('74 °F')).toBeInTheDocument();
    expect(screen.getByText('81 °F')).toBeInTheDocument();
    expect(within(hourly).getAllByText('74 °F')).toHaveLength(120);
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);
    await user.clear(input);
    await user.type(input, 'Manaus{Enter}');
    expect(await screen.findByText('Nenhuma cidade encontrada.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
    expect(searchCities).toHaveBeenLastCalledWith('Manaus');
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('exibe carregamento, erro e permite repetir a mesma busca', async () => {
    const user = userEvent.setup();
    let rejectSearch: (reason?: unknown) => void = () => {};
    vi.mocked(searchCities)
      .mockImplementationOnce(
        () =>
          new Promise<City[]>((_resolve, reject) => {
            rejectSearch = reject;
          }),
      )
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    render(<App />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'São Paulo{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
    expect(input).toHaveFocus();
    expect(screen.getByRole('main').querySelector('[aria-busy="true"]')).toBeInTheDocument();
    rejectSearch(new Error('Falha de rede.'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível buscar cidades. Tente novamente.',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(searchCities).toHaveBeenNthCalledWith(1, 'São Paulo');
    expect(searchCities).toHaveBeenNthCalledWith(2, 'São Paulo');
  });

  it('repete a previsão sem refazer a busca de cidades', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockResolvedValueOnce(mockWeatherData);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os dados. Tente novamente.',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(mockWeatherData.city);
  });

  it('ignora respostas de buscas anteriores quando chegam fora de ordem', async () => {
    const user = userEvent.setup();
    let resolveFirst: (value: City[]) => void = () => {};
    vi.mocked(searchCities)
      .mockImplementationOnce(
        () =>
          new Promise<City[]>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce([]);
    render(<App />);

    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'São Paulo{Enter}');
    await user.clear(input);
    await user.type(input, 'Manaus{Enter}');
    expect(await screen.findByText('Nenhuma cidade encontrada.')).toBeInTheDocument();
    await act(async () => {
      resolveFirst([mockWeatherData.city]);
    });
    expect(screen.getByText('Nenhuma cidade encontrada.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
  });
});
