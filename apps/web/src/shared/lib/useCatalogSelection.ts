import { useCallback, useEffect, useRef, useState } from 'react';

import type { Coords } from '@web/shared/types';

import { coordsOf } from './coordsOf';

type Selectable = { id: string; lat?: number | null; lng?: number | null };

export const useCatalogSelection = <T extends Selectable>(
  items: T[],
  isEditing: boolean
) => {
  const [idSelected, setIdSelected] = useState<string>();
  const [isDirty, setIsDirty] = useState(false);
  const [draftPoint, setDraftPoint] = useState<Coords>();
  const isClearedRef = useRef(false);

  // No form is mounted once nothing is selected, so nothing would ever report
  // the edits as gone.
  const select = useCallback(
    (id?: string) => {
      isClearedRef.current = !id;
      setIdSelected(id);
      setIsDirty(false);
      setDraftPoint(coordsOf(items.find((item) => item.id === id)));
    },
    [items]
  );

  // The editor is useless with nothing selected, so opening it picks the first
  // item — unless the editor is already open and the selection was dropped on
  // purpose.
  useEffect(() => {
    if (!isEditing) {
      isClearedRef.current = false;

      return;
    }

    const [first] = items;

    if (!idSelected && !isClearedRef.current && first) {
      select(first.id);
    }
  }, [isEditing, items, idSelected, select]);

  return {
    idSelected,
    isDirty,
    draftPoint,
    select,
    setIsDirty,
    setDraftPoint
  };
};
