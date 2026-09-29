import { useEffect, useState } from 'react';

// Created in the effect, not in a memo: a memo is not recomputed when React
// remounts the component, so the URL the cleanup revoked stays in the DOM.
export const useObjectUrl = (file: File): string => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const created = URL.createObjectURL(file);

    setUrl(created);

    return () => URL.revokeObjectURL(created);
  }, [file]);

  return url;
};
