import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('format helpers', () => {
  it('rotula os dois primeiros dias como Hoje e Amanhã', () => {
    expect(getDayLabel('2026-11-11', 0)).toBe('Hoje');
    expect(getDayLabel('2026-11-12', 1)).toBe('Amanhã');
  });

  it('usa o dia da semana nos demais índices', () => {
    expect(getDayLabel('2026-11-13', 2)).toBe('Sex');
  });

  it('formata a data curta como dia e mês abreviado', () => {
    expect(getShortDate('2026-11-11')).toBe('11 Nov');
  });
});
