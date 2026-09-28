import { describe, expect, it } from 'vitest';

import { localNameOf } from './localNameOf';

describe('localNameOf', () => {
  it('keeps a spelling the Latin name does not already carry', () => {
    expect(localNameOf('Nejasyt', 'Неясить')).toBe('Неясить');
  });

  it('drops a transliteration that came out identical', () => {
    expect(localNameOf('Bastion', 'Bastion')).toBeNull();
  });

  it('has nothing to print when no local name was written', () => {
    expect(localNameOf('Bastion')).toBeNull();
    expect(localNameOf('Bastion', '')).toBeNull();
    expect(localNameOf('Bastion', null)).toBeNull();
  });
});
