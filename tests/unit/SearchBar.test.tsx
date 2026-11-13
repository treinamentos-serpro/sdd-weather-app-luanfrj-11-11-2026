import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

afterEach(cleanup);

describe('SearchBar', () => {
  it('envia o termo aparado somente ao buscar por botão ou Enter', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, '  São Paulo  ');
    expect(onSearch).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.type(input, '{Enter}');
    expect(onSearch).toHaveBeenCalledTimes(2);
    expect(onSearch).toHaveBeenNthCalledWith(1, 'São Paulo');
    expect(onSearch).toHaveBeenNthCalledWith(2, 'São Paulo');
  });

  it('informa erros para entrada vazia ou curta e limita o campo a 100 caracteres', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    const button = screen.getByRole('button', { name: 'Buscar' });

    await user.click(button);
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome de uma cidade.');
    await user.type(input, '   ');
    await user.click(button);
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome de uma cidade.');
    await user.clear(input);
    await user.type(input, ' a ');
    await user.click(button);
    expect(screen.getByRole('alert')).toHaveTextContent('Digite pelo menos 2 caracteres.');
    expect(onSearch).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, 'a'.repeat(101));
    expect(input).toHaveValue('a'.repeat(100));
  });

  it('desabilita o campo e o botão durante uma operação', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} disabled />);

    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeDisabled();
    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onSearch).not.toHaveBeenCalled();
  });
});