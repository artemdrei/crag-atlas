import { describe, expect, it } from 'vitest';

import { parseCoords } from './parseCoords';

describe('parseCoords', () => {
  it('reads a copied pair', () => {
    expect(parseCoords('48.68291, 26.56402')).toEqual({
      lat: 48.68291,
      lng: 26.56402
    });
  });

  it('reads the pair inside a map link', () => {
    expect(
      parseCoords('https://www.google.com/maps/@48.68291,26.56402,17z')
    ).toEqual({ lat: 48.68291, lng: 26.56402 });
  });

  it('reads degrees, minutes and seconds', () => {
    const coords = parseCoords(`48°40'58.5"N 26°33'50.5"E`);

    expect(coords?.lat).toBeCloseTo(48.68292, 4);
    expect(coords?.lng).toBeCloseTo(26.56403, 4);
  });

  it('turns southern and western hemispheres negative', () => {
    const coords = parseCoords(`33°51'35.9"S 151°12'40.0"W`);

    expect(coords?.lat).toBeLessThan(0);
    expect(coords?.lng).toBeLessThan(0);
  });

  it('rejects a pair outside the globe', () => {
    expect(parseCoords('148.6, 26.5')).toBeUndefined();
  });

  it('rejects a short link, which carries no numbers', () => {
    expect(parseCoords('https://maps.app.goo.gl/abcdef')).toBeUndefined();
  });
});
