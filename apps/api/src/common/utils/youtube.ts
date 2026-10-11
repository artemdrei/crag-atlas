// Kept in step with `parseMediaLink` on the web side and `youtube_id_of()` in
// `023_media_source_guard.sql`: all three must name the same video.
const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be'
];

const ID_PATTERN = /^[\w-]{5,32}$/;

export const idYoutubeOf = (value: string): string | undefined => {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    return undefined;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;

  if (!YOUTUBE_HOSTS.includes(url.hostname)) return undefined;

  const id = idFromPath(url, url.pathname.split('/').filter(Boolean));

  return id && ID_PATTERN.test(id) ? id : undefined;
};

export const youtubeWatchUrl = (id: string): string =>
  `https://www.youtube.com/watch?v=${id}`;

const idFromPath = (url: URL, segments: string[]): string | undefined => {
  if (url.hostname === 'youtu.be') return segments[0];

  const [kind, id] = segments;

  if (kind === 'shorts' || kind === 'embed' || kind === 'live') return id;

  return url.searchParams.get('v') ?? undefined;
};
