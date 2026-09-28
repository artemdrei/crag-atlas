import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCatalogSelection } from './useCatalogSelection';

const ITEMS = [
  { id: 'a', lat: 1, lng: 1 },
  { id: 'b', lat: 2, lng: 2 },
  { id: 'c', lat: 3, lng: 3 }
];

const render = (isEditing: boolean) =>
  renderHook(({ editing }) => useCatalogSelection(ITEMS, editing), {
    initialProps: { editing: isEditing }
  });

describe('useCatalogSelection', () => {
  it('picks the first item when the editor opens on nothing', () => {
    const { result, rerender } = render(false);

    rerender({ editing: true });

    expect(result.current.idSelected).toBe('a');
  });

  it('keeps a selection made in the same batch as the editor opening', () => {
    const { result, rerender } = render(false);

    act(() => result.current.select('c'));
    rerender({ editing: true });

    expect(result.current.idSelected).toBe('c');
    expect(result.current.draftPoint).toEqual({ lat: 3, lng: 3 });
  });

  it('keeps a selection made after the editor is already open', () => {
    const { result, rerender } = render(false);

    rerender({ editing: true });
    act(() => result.current.select('c'));

    expect(result.current.idSelected).toBe('c');
  });

  it('leaves the editor empty when the selection was dropped on purpose', () => {
    const { result, rerender } = render(false);

    rerender({ editing: true });
    act(() => result.current.select(undefined));

    expect(result.current.idSelected).toBeUndefined();
  });
});
