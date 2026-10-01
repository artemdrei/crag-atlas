// Anything but http/https (`javascript:`, `data:`) executes in the visitor's
// session once it reaches an `href`.
export const isSafeHttpUrl = (value?: string | null): boolean => {
  if (!value) return false;

  try {
    const { protocol } = new URL(value);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};
