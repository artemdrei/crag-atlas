import type { RouteMedia } from '@crag-atlas/api';
import { describe, expect, it } from 'vitest';

import { mediaCreditOf } from './mediaCreditOf';

const item = (overrides: Partial<RouteMedia>): RouteMedia =>
  ({
    authorName: 'Olena',
    channelName: null,
    publishedAt: null,
    createdAt: '2026-10-01T10:00:00Z',
    ...overrides
  }) as RouteMedia;

describe('mediaCreditOf', () => {
  it('credits the YouTube channel and the year it went up there', () => {
    expect(
      mediaCreditOf(
        item({ channelName: 'Crag TV', publishedAt: '2019-03-02T00:00:00Z' })
      )
    ).toEqual({ author: 'Crag TV', date: '2019' });
  });

  it('credits whoever linked it, and when, without a YouTube source', () => {
    expect(mediaCreditOf(item({}))).toEqual({ author: 'Olena', date: '2026' });
  });

  it('falls back to whoever linked it for a blank channel', () => {
    expect(mediaCreditOf(item({ channelName: '' })).author).toBe('Olena');
  });
});
