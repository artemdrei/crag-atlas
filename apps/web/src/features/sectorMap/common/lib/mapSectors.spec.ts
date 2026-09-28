import type { Sector } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import { mapSectors } from './mapSectors';

const sectorOf = (id: string, lat?: number, lng?: number) =>
  ({ id, name: id, lat, lng }) as Sector;

describe('mapSectors', () => {
  it('keeps only the sectors that have a point', () => {
    const mapped = mapSectors([
      sectorOf('a', 1, 2),
      sectorOf('b'),
      sectorOf('c', 3, 4)
    ]);

    expect(mapped.map(({ sector }) => sector.id)).toEqual(['a', 'c']);
  });

  it('keeps the hue tied to the list position, not to the map', () => {
    const mapped = mapSectors([sectorOf('a'), sectorOf('b', 1, 2)]);

    expect(mapped[0]?.toneIndex).toBe(1);
  });

  it('draws the override instead of the saved point', () => {
    const mapped = mapSectors([sectorOf('a', 1, 2)], {
      id: 'a',
      point: { lat: 5, lng: 6 }
    });

    expect(mapped[0]?.point).toEqual({ lat: 5, lng: 6 });
  });

  it('drops the pin while the override carries no point', () => {
    const mapped = mapSectors([sectorOf('a', 1, 2)], { id: 'a' });

    expect(mapped).toEqual([]);
  });
});
