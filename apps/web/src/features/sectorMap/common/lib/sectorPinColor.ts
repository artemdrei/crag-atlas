import type { MappedSector } from '../entities';

const FALLBACK = 'currentColor';

export const sectorPinColor = (colors: string[], toneIndex: number) =>
  colors[toneIndex % colors.length] ?? FALLBACK;

export const sectorPinColors = (mapped: MappedSector[], colors: string[]) =>
  Object.fromEntries(
    mapped.map(({ sector, toneIndex }) => [
      sector.id,
      sectorPinColor(colors, toneIndex)
    ])
  );
