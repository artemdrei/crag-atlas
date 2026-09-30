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

// Above the block that loads the charmap on purpose: `transliterate` is
// cached module-wide, so the same assertions below it would pass either way.
describe('before the charmap arrives', () => {
  it('still follows a Latin name, which needs no charmap at all', () => {
    expect(followLatin('', '', 'Verdon')).toEqual({
      name: 'Verdon',
      nameLocal: 'Verdon'
    });
  });

  it('leaves the Latin box empty for a name it cannot rewrite yet', () => {
    expect(followLatin('', '', 'Денеші')).toEqual({
      name: '',
      nameLocal: 'Денеші'
    });
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
