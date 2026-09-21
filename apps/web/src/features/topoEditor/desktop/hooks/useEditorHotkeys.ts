import { useEffect } from 'react';

export interface Params {
  isEnabled: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onEscape: () => void;
}

/** Bails out in text entry: Cmd+Z in the description is the browser's undo. */
export const useEditorHotkeys = ({
  isEnabled,
  onUndo,
  onRedo,
  onDelete,
  onEscape
}: Params) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      const isCommand = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (isCommand && key === 'z') {
        event.preventDefault();
        (event.shiftKey ? onRedo : onUndo)();

        return;
      }

      if (isCommand && key === 'y') {
        event.preventDefault();
        onRedo();

        return;
      }

      if (key === 'delete' || key === 'backspace') {
        event.preventDefault();
        onDelete();

        return;
      }

      if (key === 'escape') onEscape();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, onUndo, onRedo, onDelete, onEscape]);
};
