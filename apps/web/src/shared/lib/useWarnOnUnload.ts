import { useEffect } from 'react';

/** Lets the browser ask before a reload or a closed tab throws work away. */
export const useWarnOnUnload = (isDirty: boolean) => {
  useEffect(() => {
    if (!isDirty) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener('beforeunload', warn);

    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);
};
