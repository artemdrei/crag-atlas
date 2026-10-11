import type { RouteMedia } from '@crag-atlas/api';

export const mediaCreditOf = (
  item: RouteMedia
): { author: string; date: string } => ({
  author: item.channelName || item.authorName,
  date: (item.publishedAt ?? item.createdAt).slice(0, 4)
});
