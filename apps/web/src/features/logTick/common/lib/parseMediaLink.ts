import { isSafeHttpUrl } from '@web/shared/lib';

const HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'm.youtube.com',
  'instagram.com',
  'www.instagram.com'
];

export const parseMediaLink = (value: string): string | undefined => {
  try {
    const url = new URL(value.trim());

    if (!isSafeHttpUrl(url.href)) return undefined;

    return HOSTS.includes(url.hostname) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};
