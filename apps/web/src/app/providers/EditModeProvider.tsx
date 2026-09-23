import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useSearchParamFlags } from '@web/shared/lib';

interface EditModeContextValue {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export const EditModeProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const value = useMemo(() => ({ isEditing, setIsEditing }), [isEditing]);

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};

const EDITOR_FLAGS = ['edit', 'archive'] as const;

// The URL owns whether the editor is open; the provider only mirrors it so the
// theme can tint.
export const useEditModeInUrl = () => {
  const { setIsEditing: mirror } = useEditMode();
  const [flags, setFlags] = useSearchParamFlags(EDITOR_FLAGS);

  const isEditing = flags.edit;

  useEffect(() => {
    mirror(isEditing);

    return () => mirror(false);
  }, [isEditing, mirror]);

  return {
    isEditing,
    // A pasted ?archive=1 without ?edit=1 shows the catalog, not the archive.
    isArchiveShown: flags.edit && flags.archive,
    // Closing the editor takes the archive with it, in one write: the archive
    // is a view inside editing, never a place to come back to without it.
    setIsEditing: (next: boolean) =>
      setFlags(next ? { edit: true } : { edit: false, archive: false }),
    setIsArchiveShown: (next: boolean) => setFlags({ archive: next })
  };
};

export const useEditModeWhileMounted = () => {
  const { setIsEditing } = useEditMode();

  useEffect(() => {
    setIsEditing(true);

    return () => setIsEditing(false);
  }, [setIsEditing]);
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);

  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }

  return context;
};
