import { useCallback, useMemo, useRef, useState } from 'react';

import type { TopoEditorSession } from '../entities';
import { EMPTY_SESSION } from '../entities';
import type { EditorAction } from '../model';
import { editorSessionReducer, HISTORY_SKIPPED_ACTIONS } from '../model';

const MAX_HISTORY = 50;

interface History {
  past: TopoEditorSession[];
  present: TopoEditorSession;
  future: TopoEditorSession[];
}

export const useTopoEditorSession = () => {
  const [history, setHistory] = useState<History>({
    past: [],
    present: EMPTY_SESSION,
    future: []
  });

  // One snapshot per gesture: undo rewinds a whole drag, not one frame of it.
  const isGestureOpen = useRef(false);

  const dispatch = useCallback((action: EditorAction) => {
    setHistory((current) => {
      const next = editorSessionReducer(current.present, action);

      if (next === current.present) return current;

      const isRecorded =
        !HISTORY_SKIPPED_ACTIONS.has(action.type) && !isGestureOpen.current;

      if (!isRecorded) return { ...current, present: next };

      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: next,
        future: []
      };
    });
  }, []);

  const beginGesture = useCallback(() => {
    if (isGestureOpen.current) return;

    isGestureOpen.current = true;

    setHistory((current) => ({
      past: [...current.past, current.present].slice(-MAX_HISTORY),
      present: current.present,
      future: []
    }));
  }, []);

  const endGesture = useCallback(() => {
    isGestureOpen.current = false;
  }, []);

  // A server-side delete makes every snapshot a lie about what exists.
  const resetHistory = useCallback(() => {
    setHistory((current) => ({
      past: [],
      present: current.present,
      future: []
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      const previous = current.past[current.past.length - 1];

      if (!previous) return current;

      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      const [next, ...rest] = current.future;

      if (!next) return current;

      return {
        past: [...current.past, current.present],
        present: next,
        future: rest
      };
    });
  }, []);

  return useMemo(
    () => ({
      session: history.present,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      dispatch,
      beginGesture,
      endGesture,
      resetHistory,
      undo,
      redo
    }),
    [history, dispatch, beginGesture, endGesture, resetHistory, undo, redo]
  );
};

export type TopoEditorSessionApi = ReturnType<typeof useTopoEditorSession>;
