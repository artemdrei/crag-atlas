/**
 * Guards user-submitted links before they reach an `href`: anything but
 * http/https (`javascript:`, `data:`) executes in the visitor's session.
 */
export const isSafeHttpUrl = (value?: string | null): boolean => {
  if (!value) return false;

  try {
    const { protocol } = new URL(value);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};
