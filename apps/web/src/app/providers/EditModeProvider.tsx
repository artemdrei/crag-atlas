import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useSearchParamFlags } from '@web/shared/lib';

import { useUser } from './UserProvider';

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

// The URL owns whether the editor is open; this only mirrors it.
export const useEditModeInUrl = () => {
  const { setIsEditing: mirror } = useEditMode();
  const { hasRole } = useUser();
  const [flags, setFlags] = useSearchParamFlags(EDITOR_FLAGS);

  // ?edit=1 is a URL anyone can type, and the editor is admin-only.
  const isEditing = flags.edit && hasRole('admin');

  useEffect(() => {
    mirror(isEditing);

    return () => mirror(false);
  }, [isEditing, mirror]);

  return {
    isEditing,
    // A pasted ?archive=1 without ?edit=1 shows the catalog, not the archive.
    isArchiveShown: isEditing && flags.archive,
    // One write: the archive is a view inside editing, never a place of
    // its own to come back to.
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
