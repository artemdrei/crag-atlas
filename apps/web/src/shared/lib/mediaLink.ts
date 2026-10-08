import type { RouteMedia } from '@crag-atlas/api';

import { isSafeHttpUrl } from './isSafeHttpUrl';

export interface MediaLink {
  id: string;
  url: string;
}

const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be'
];

const ID_PATTERN = /^[\w-]{5,32}$/;

export const parseMediaLink = (value: string): MediaLink | undefined => {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    return undefined;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;

  if (!YOUTUBE_HOSTS.includes(url.hostname)) return undefined;

  const id = youtubeId(url, url.pathname.split('/').filter(Boolean));

  return id && ID_PATTERN.test(id) ? { id, url: url.toString() } : undefined;
};

// Built from the parsed id, never the stored url: what a climber typed must
// not reach an iframe `src` unchecked.
// Without playsinline iOS hands the video to its fullscreen player.
export const mediaEmbedUrl = ({ id }: MediaLink): string =>
  `https://www.youtube-nocookie.com/embed/${id}?playsinline=1`;

export const mediaThumbnailUrl = ({ id }: MediaLink): string =>
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const youtubeId = (url: URL, segments: string[]): string | undefined => {
  if (url.hostname === 'youtu.be') return segments[0];

  const [kind, id] = segments;

  if (kind === 'shorts' || kind === 'embed' || kind === 'live') return id;

  return url.searchParams.get('v') ?? undefined;
};

export const mediaThumbnailOf = (item: RouteMedia): string | undefined => {
  if (item.kind === 'photo') {
    return isSafeHttpUrl(item.url) ? item.url : undefined;
  }

  const link = parseMediaLink(item.url);

  return link && mediaThumbnailUrl(link);
};
