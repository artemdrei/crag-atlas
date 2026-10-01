import type { RouteMedia } from '@crag-atlas/api';

import { isSafeHttpUrl } from './isSafeHttpUrl';

export type MediaProvider = 'youtube' | 'instagram';

export interface MediaLink {
  provider: MediaProvider;
  id: string;
  url: string;
}

const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be'
];

const INSTAGRAM_HOSTS = ['instagram.com', 'www.instagram.com'];

const INSTAGRAM_PATHS = ['p', 'reel', 'reels', 'tv'];

const ID_PATTERN = /^[\w-]{5,32}$/;

export const parseMediaLink = (value: string): MediaLink | undefined => {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    return undefined;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;

  const segments = url.pathname.split('/').filter(Boolean);

  if (YOUTUBE_HOSTS.includes(url.hostname)) {
    const id = youtubeId(url, segments);

    return id && ID_PATTERN.test(id)
      ? { provider: 'youtube', id, url: url.toString() }
      : undefined;
  }

  if (INSTAGRAM_HOSTS.includes(url.hostname)) {
    const [kind, code] = segments;

    return kind &&
      INSTAGRAM_PATHS.includes(kind) &&
      code &&
      ID_PATTERN.test(code)
      ? { provider: 'instagram', id: code, url: url.toString() }
      : undefined;
  }

  return undefined;
};

// Built from the parsed id, never the stored url: what a climber typed must
// not reach an iframe `src` unchecked.
export const mediaEmbedUrl = ({ provider, id }: MediaLink): string =>
  provider === 'youtube'
    ? // Without playsinline iOS hands the video to its fullscreen player.
      `https://www.youtube-nocookie.com/embed/${id}?playsinline=1`
    : `https://www.instagram.com/p/${id}/embed`;

// Instagram serves no thumbnail without an API token.
export const mediaThumbnailUrl = ({
  provider,
  id
}: MediaLink): string | undefined =>
  provider === 'youtube'
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : undefined;

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
