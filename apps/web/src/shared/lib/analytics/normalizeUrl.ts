import { normalizePath } from './normalizePath';

// A referrer is a whole url, so its path spells out the same uuids.
export const normalizeUrl = (url: string) => {
  try {
    const { protocol, origin, pathname } = new URL(url);

    // An app scheme has an opaque path and a null origin: nothing to mask,
    // and rebuilding it would corrupt it.
    if (protocol !== 'http:' && protocol !== 'https:') return url;

    return origin + normalizePath(pathname);
  } catch {
    return url;
  }
};
