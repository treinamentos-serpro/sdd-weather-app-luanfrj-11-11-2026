import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';

afterEach(cleanup);

describe('UnitToggle', () => {
  it('expõe a unidade ativa e acompanha mudanças da prop', () => {
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Unidade de temperatura' });
    const celsius = within(group).getByRole('button', { name: '°C' });
    const fahrenheit = within(group).getByRole('button', { name: '°F' });

    expect(celsius).toHaveAttribute('aria-pressed', 'true');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'false');
    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(celsius).toHaveAttribute('aria-pressed', 'false');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  });

  it('permite selecionar ambas as unidades com Tab, Espaço e Enter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UnitToggle unit="celsius" onChange={onChange} />);
    const celsius = screen.getByRole('button', { name: '°C' });
    const fahrenheit = screen.getByRole('button', { name: '°F' });

    await user.tab();
    expect(celsius).toHaveFocus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    await user.tab();
    expect(fahrenheit).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('notifica a seleção por clique', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });
});