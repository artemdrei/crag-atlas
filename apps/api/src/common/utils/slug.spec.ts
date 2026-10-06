import { describe, expect, it } from 'vitest';

import { freeSlug, isSlug, toSlug } from './slug';

describe('toSlug', () => {
  it('folds the diacritics crag names are written with', () => {
    expect(toSlug('Mišja peč')).toBe('misja-pec');
    expect(toSlug('Céüse')).toBe('ceuse');
    expect(toSlug('Rødland')).toBe('rodland');
  });

  it('keeps a word with an apostrophe whole', () => {
    expect(toSlug("Dal'nij")).toBe('dalnij');
    expect(toSlug('Strimka Lan’')).toBe('strimka-lan');
  });

  it('collapses punctuation and spaces into single hyphens', () => {
    expect(toSlug('  Kamianets — Podilskyi (Old Town) ')).toBe(
      'kamianets-podilskyi-old-town'
    );
  });

  it('cuts a long name at a word boundary', () => {
    const slug = toSlug(
      'The Very Long Sector Name Beside The Old River Bridge'
    );

    expect(slug).toBe('the-very-long-sector-name-beside-the-old');
    expect(isSlug(slug)).toBe(true);
  });
});

describe('isSlug', () => {
  it('takes lowercase words joined by single hyphens', () => {
    expect(isSlug('mist')).toBe(true);
    expect(isSlug('mist-2')).toBe(true);
  });

  it('refuses anything a URL would have to encode or a reader would misread', () => {
    expect(isSlug('Mist')).toBe(false);
    expect(isSlug('mist--old')).toBe(false);
    expect(isSlug('-mist')).toBe(false);
    expect(isSlug('міст')).toBe(false);
    expect(isSlug('')).toBe(false);
  });
});

describe('freeSlug', () => {
  it('numbers a slug that is already taken', () => {
    const taken = new Set(['mist', 'mist-2']);

    expect(freeSlug('mist', (slug) => taken.has(slug))).toBe('mist-3');
    expect(freeSlug('verba', (slug) => taken.has(slug))).toBe('verba');
  });
});
