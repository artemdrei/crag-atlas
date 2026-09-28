import type { MapPoint } from '@web/shared/types';

import type { MappedSector } from '../entities';

const FALLBACK = 'currentColor';

export const sectorPinColor = (colors: string[], toneIndex: number) =>
  colors[toneIndex % colors.length] ?? FALLBACK;

export const sectorMapPoints = (
  mapped: MappedSector[],
  colors: string[]
): MapPoint[] =>
  mapped.map(({ sector, point, toneIndex }) => ({
    id: sector.id,
    point,
    color: sectorPinColor(colors, toneIndex)
  }));

export const sectorPinColors = (mapped: MappedSector[], colors: string[]) =>
  Object.fromEntries(
    mapped.map(({ sector, toneIndex }) => [
      sector.id,
      sectorPinColor(colors, toneIndex)
    ])
  );
