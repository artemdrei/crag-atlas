// Kept in step with `isSlug` in apps/api/src/common/utils/slug.ts.
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const QR_SLUG_MAX_LENGTH = 40;

export const isQrSlug = (value: string): boolean =>
  SLUG.test(value) && value.length <= QR_SLUG_MAX_LENGTH;

export const qrUrlOf = (origin: string, path: string): string =>
  `${origin}/q/${path}`;

export const qrPrefixOf = (path: string): string =>
  path.slice(0, path.lastIndexOf('/') + 1);

export const qrSlugOf = (path: string): string =>
  path.slice(path.lastIndexOf('/') + 1);
