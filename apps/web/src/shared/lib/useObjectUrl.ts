import { useEffect, useState } from 'react';

// In the effect, not a memo: a memo is not recomputed on remount, so the URL
// the cleanup revoked would stay in the DOM.
export const useObjectUrl = (file: File): string => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const created = URL.createObjectURL(file);

    setUrl(created);

    return () => URL.revokeObjectURL(created);
  }, [file]);

  return url;
};
