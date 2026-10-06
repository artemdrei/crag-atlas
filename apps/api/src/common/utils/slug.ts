import { slugify } from 'transliteration';

// Kept in step with the `check` constraints in `018_sector_qr_paths.sql`.
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const MAX_LENGTH = 40;

// Dropped rather than turned into a hyphen: `Dal'nij` is one word.
const APOSTROPHES = /['’‘`ʼ]/g;

export const isSlug = (value: string): boolean =>
  SLUG.test(value) && value.length <= MAX_LENGTH;

export const toSlug = (name: string): string => {
  const slug = slugify(name.replace(APOSTROPHES, ''), {
    lowercase: true,
    separator: '-'
  })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length <= MAX_LENGTH) return slug;

  const cut = slug.slice(0, MAX_LENGTH);
  if (slug[MAX_LENGTH] === '-') return cut;

  const lastHyphen = cut.lastIndexOf('-');

  return lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut;
};

export const freeSlug = (base: string, isTaken: (slug: string) => boolean) => {
  if (!isTaken(base)) return base;

  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${base}-${suffix}`;

    if (!isTaken(candidate)) return candidate;
  }
};
