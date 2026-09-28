import { describe, expect, it } from 'vitest';

import { isLatinName, toLatinName } from './names';

describe('latinName', () => {
  it('accepts the diacritics European crag names are written with', () => {
    expect(isLatinName('Kamianets-Podilskyi')).toBe(true);
    expect(isLatinName('Céüse')).toBe(true);
    expect(isLatinName('Rødland')).toBe(true);
    expect(isLatinName('Mišja peč')).toBe(true);
    expect(isLatinName('Chuva de Verão')).toBe(true);
  });

  it('accepts the punctuation and digits a route name carries', () => {
    expect(isLatinName("O'Brien")).toBe(true);
    expect(isLatinName('Grotta dell’Arenauta')).toBe(true);
    expect(isLatinName('Project 8a+')).toBe(true);
  });

  it('refuses any other writing system', () => {
    expect(isLatinName("Кам'янець-Подільський")).toBe(false);
    expect(isLatinName('Ελλάδα')).toBe(false);
    expect(isLatinName('石灰岩')).toBe(false);
  });

  it('trims before it judges', () => {
    expect(toLatinName('  Denyshi  ', 'REGION')).toBe('Denyshi');
  });

  it('codes each failure by entity', () => {
    expect(() => toLatinName('   ', 'REGION')).toThrowError(
      expect.objectContaining({ code: 'REGION_NAME_EMPTY' })
    );
    expect(() => toLatinName('Денеші', 'SECTOR')).toThrowError(
      expect.objectContaining({ code: 'SECTOR_NAME_NOT_LATIN' })
    );
  });
});
