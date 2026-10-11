import type { PropsWithChildren } from 'react';
import { MemoryRouter, useLocation } from 'react-router';

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useVideoFilters } from './useVideoFilters';

const trackListControl = vi.fn();

vi.mock('@web/shared/lib', () => ({
  trackListControl: (...args: unknown[]) => trackListControl(...args)
}));

const render = (initial: string) => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
  );

  return renderHook(
    () => ({ ...useVideoFilters(), search: useLocation().search }),
    { wrapper }
  );
};

describe('useVideoFilters', () => {
  beforeEach(() => trackListControl.mockClear());

  it('reads the filters from the url', () => {
    const { result } = render('/media?q=pyrih&from=6a&to=7a&sort=oldest');

    expect(result.current.filters).toEqual({
      query: 'pyrih',
      gradeFrom: '6a',
      gradeTo: '7a',
      sort: 'oldest'
    });
  });

  it('falls back to newest for a sort it does not know', () => {
    const { result } = render('/media?sort=random');

    expect(result.current.filters.sort).toBe('newest');
  });

  it('keeps defaults out of the url', () => {
    const { result } = render('/media?sort=oldest&q=pyrih');

    act(() => result.current.changeFilters({ sort: 'newest', query: '' }));

    expect(result.current.search).toBe('');
  });

  it('drops the highlighted card on any change', () => {
    const { result } = render('/media?added=abc');

    expect(result.current.idAdded).toBe('abc');

    act(() => result.current.changeFilters({ gradeFrom: '6a' }));

    expect(result.current.idAdded).toBeNull();
    expect(result.current.search).toBe('?from=6a');
  });

  it('reports the sort and each side of the grade band', () => {
    const { result } = render('/media');

    act(() => result.current.changeFilters({ sort: 'oldest' }));
    act(() => result.current.changeFilters({ gradeFrom: '6a' }));
    act(() => result.current.changeFilters({ gradeTo: '7a' }));

    expect(trackListControl.mock.calls).toEqual([
      ['media', 'sort', 'oldest'],
      ['media', 'grade_filter', 'from:6a'],
      ['media', 'grade_filter', 'to:7a']
    ]);
  });

  it('reports clearing the band as one reset', () => {
    const { result } = render('/media?from=6a&to=7a');

    act(() => result.current.changeFilters({ gradeFrom: '', gradeTo: '' }));

    expect(trackListControl.mock.calls).toEqual([
      ['media', 'grade_filter_reset', '']
    ]);
  });

  it('leaves the typed query to the debounced search report', () => {
    const { result } = render('/media');

    act(() => result.current.changeFilters({ query: 'py' }));

    expect(trackListControl).not.toHaveBeenCalled();
  });
});
