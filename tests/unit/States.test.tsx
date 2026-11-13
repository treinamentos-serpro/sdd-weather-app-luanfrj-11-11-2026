import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

afterEach(cleanup);

describe('estados de carregamento, erro e vazio', () => {
  it('anuncia carregamento e respeita movimento reduzido', () => {
    const { container } = render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      'motion-reduce:animate-none',
    );
  });

  it('anuncia a mensagem e permite nova tentativa por teclado', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <ErrorState
        message="Não foi possível carregar os dados. Tente novamente."
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os dados. Tente novamente.',
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('desabilita a nova tentativa quando solicitado', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState message="Erro" onRetry={onRetry} disabled />);

    const button = screen.getByRole('button', { name: 'Tentar novamente' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('mostra o título e a dica padrão ou personalizados', () => {
    const { rerender } = render(<EmptyState />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma cidade encontrada. Confira a grafia e tente novamente.',
    );
    rerender(<EmptyState title="Sem dados" hint="Tente outra cidade." />);
    expect(screen.getByRole('heading', { name: 'Sem dados' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Tente outra cidade.');
  });
});
