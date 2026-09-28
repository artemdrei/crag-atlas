import { beforeAll, describe, expect, it } from 'vitest';

import {
  followLatin,
  isLatinName,
  loadTransliteration,
  toLatin
} from './toLatin';

describe('isLatinName', () => {
  it('accepts the diacritics European crag names are written with', () => {
    expect(isLatinName('Céüse')).toBe(true);
    expect(isLatinName('Rødland')).toBe(true);
    expect(isLatinName('Mišja peč')).toBe(true);
  });

  it('refuses any other writing system', () => {
    expect(isLatinName("Кам'янець-Подільський")).toBe(false);
    expect(isLatinName('Ελλάδα')).toBe(false);
    expect(isLatinName('石灰岩')).toBe(false);
  });
});

describe('once the charmap is loaded', () => {
  beforeAll(() => loadTransliteration());

  it('rewrites whatever writing system it is given', () => {
    expect(toLatin('Денеші')).toBe('Deneshi');
    expect(toLatin('Ελλάδα')).toBe('Ellada');
  });

  it('leaves a Latin name alone, diacritics and all', () => {
    expect(toLatin('Céüse')).toBe('Céüse');
    expect(toLatin('Rødland')).toBe('Rødland');
  });

  it('rewrites the Latin name while it still follows the local one', () => {
    expect(followLatin('Deneshi', 'Денеші', 'Денеші!')).toEqual({
      name: 'Deneshi!',
      nameLocal: 'Денеші!'
    });
  });

  it('leaves a Latin name somebody wrote themselves alone', () => {
    expect(followLatin('Denesh', 'Денеші', 'Денеші!')).toEqual({
      name: 'Denesh',
      nameLocal: 'Денеші!'
    });
  });
});
