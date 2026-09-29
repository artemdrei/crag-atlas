import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCatalogSelection } from './useCatalogSelection';

const ITEMS = [
  { id: 'a', lat: 1, lng: 1 },
  { id: 'b', lat: 2, lng: 2 },
  { id: 'c', lat: 3, lng: 3 }
];

const render = (items: typeof ITEMS = ITEMS) =>
  renderHook(({ rows }) => useCatalogSelection(rows), {
    initialProps: { rows: items }
  });

describe('useCatalogSelection', () => {
  it('opens on the first item, so the map has a card from the start', () => {
    const { result } = render();

    expect(result.current.idSelected).toBe('a');
    expect(result.current.draftPoint).toEqual({ lat: 1, lng: 1 });
  });

  it('waits for the rows before it picks anything', () => {
    const { result, rerender } = render([]);

    expect(result.current.idSelected).toBeUndefined();

    rerender({ rows: ITEMS });

    expect(result.current.idSelected).toBe('a');
  });

  it('keeps a selection the reader made', () => {
    const { result } = render();

    act(() => result.current.select('c'));

    expect(result.current.idSelected).toBe('c');
    expect(result.current.draftPoint).toEqual({ lat: 3, lng: 3 });
  });

  it('stays empty when the selection was dropped on purpose', () => {
    const { result } = render();

    act(() => result.current.select(undefined));

    expect(result.current.idSelected).toBeUndefined();
  });
});
