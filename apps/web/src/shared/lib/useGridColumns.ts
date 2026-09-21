import { useState } from 'react';

export const GRID_COLUMN_CHOICES = [1, 2, 3, 4] as const;

export type GridColumns = (typeof GRID_COLUMN_CHOICES)[number];

const isColumns = (value: unknown): value is GridColumns =>
  GRID_COLUMN_CHOICES.includes(value as GridColumns);

/**
 * How many cards a list shows per row. A per-viewer convenience, so it lives
 * in this browser and nowhere else; private windows and blocked site data
 * both throw, hence the try/catch.
 */
export const useGridColumns = (storageKey: string) => {
  const [columns, setColumns] = useState<GridColumns>(() => {
    try {
      const stored = Number(localStorage.getItem(storageKey));

      return isColumns(stored) ? stored : 1;
    } catch {
      return 1;
    }
  });

  const changeColumns = (next: GridColumns) => {
    setColumns(next);

    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // Remembering is a nicety; the page works without it.
    }
  };

  return { columns, changeColumns };
};
