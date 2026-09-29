import { useCallback, useEffect, useRef, useState } from 'react';

import type { Coords } from '@web/shared/types';

import { coordsOf } from './coordsOf';

type Selectable = { id: string; lat?: number | null; lng?: number | null };

export const useCatalogSelection = <T extends Selectable>(items: T[]) => {
  const [idSelected, setIdSelected] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);
  const [draftPoint, setDraftPoint] = useState<Coords>();
  const isClearedRef = useRef(false);

  // Nothing is mounted to report the edits as gone once the selection drops.
  const select = useCallback(
    (id?: string) => {
      isClearedRef.current = !id;
      setIdSelected(id);
      setIsDirty(false);
      setDraftPoint(coordsOf(items.find((item) => item.id === id)));
    },
    [items]
  );

  // Auto-picked so the screen opens on something, but never re-picked after
  // the reader drops the selection themselves.
  useEffect(() => {
    const [first] = items;

    if (!idSelected && !isClearedRef.current && first) {
      select(first.id);
    }
  }, [items, idSelected, select]);

  return {
    idSelected,
    isDirty,
    draftPoint,
    select,
    setIsDirty,
    setDraftPoint
  };
};
