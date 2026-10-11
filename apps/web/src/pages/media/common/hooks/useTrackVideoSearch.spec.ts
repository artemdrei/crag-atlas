import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTrackVideoSearch } from './useTrackVideoSearch';

const track = vi.fn();

vi.mock('@crag-atlas/analytics', () => ({
  track: (event: unknown) => track(event)
}));

describe('useTrackVideoSearch', () => {
  beforeEach(() => track.mockClear());

  const render = (term: string, total: number | undefined) =>
    renderHook(({ term, total }) => useTrackVideoSearch(term, total), {
      initialProps: { term, total }
    });

  it('waits for the count of the term before reporting it', () => {
    const { rerender } = render('pyrih', undefined);

    expect(track).not.toHaveBeenCalled();

    rerender({ term: 'pyrih', total: 0 });

    expect(track).toHaveBeenCalledWith({
      name: 'Search Performed',
      props: {
        scope: 'media',
        term_length: 5,
        result_count: 0,
        has_results: false
      }
    });
  });

  it('reports a term once, however often its count comes back', () => {
    const { rerender } = render('pyrih', 3);

    rerender({ term: 'pyrih', total: 4 });

    expect(track).toHaveBeenCalledTimes(1);
  });

  it('reports nothing for an empty search', () => {
    render('', 40);

    expect(track).not.toHaveBeenCalled();
  });
});
