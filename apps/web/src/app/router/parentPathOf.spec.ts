import { describe, expect, it } from 'vitest';

import { parentPathOf } from './parentPathOf';

describe('parentPathOf', () => {
  it('climbs from a route to its sector', () => {
    expect(parentPathOf('/regions/r1/sectors/s1/routes/x1')).toBe(
      '/regions/r1/sectors/s1'
    );
  });

  it('climbs from a sector to its region', () => {
    expect(parentPathOf('/regions/r1/sectors/s1')).toBe('/regions/r1');
  });

  it('climbs from a region to the catalog', () => {
    expect(parentPathOf('/regions/r1')).toBe('/');
  });

  it('climbs from access management to the profile', () => {
    expect(parentPathOf('/access')).toBe('/profile');
  });

  it('has nothing above a tab', () => {
    expect(parentPathOf('/')).toBeNull();
    expect(parentPathOf('/logbook')).toBeNull();
    expect(parentPathOf('/profile')).toBeNull();
  });
});
