import type { PropsWithChildren } from 'react';
import { MemoryRouter, useLocation } from 'react-router';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSearchParamFlags } from './useSearchParamFlags';

const KEYS = ['edit', 'archive'] as const;

const render = <T,>(initial: string, hook: () => T) => {
  const wrapper = ({ children }: PropsWithChildren) => (
    <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
  );

  return renderHook(() => ({ ...hook(), search: useLocation().search }), {
    wrapper
  });
};

describe('useSearchParamFlags', () => {
  const renderFlags = (initial: string) =>
    render(initial, () => {
      const [flags, setFlags] = useSearchParamFlags(KEYS);

      return { flags, setFlags };
    });

  it('treats a missing key as off', () => {
    const { result } = renderFlags('/');

    expect(result.current.flags).toEqual({ edit: false, archive: false });
  });

  it('drops a key instead of writing a falsy value', () => {
    const { result } = renderFlags('/?edit=1');

    act(() => result.current.setFlags({ edit: false }));

    expect(result.current.search).toBe('');
  });

  it('reads every key it was given', () => {
    const { result } = renderFlags('/?edit=1');

    expect(result.current.flags).toEqual({ edit: true, archive: false });
  });

  // Two separate setters would each write the params of the render they came
  // from, so the second would put the first one's key back.
  it('clears several keys in one write', () => {
    const { result } = renderFlags('/?edit=1&archive=1');

    act(() => result.current.setFlags({ edit: false, archive: false }));

    expect(result.current.search).toBe('');
  });

  it('leaves the keys it was not told about alone', () => {
    const { result } = renderFlags('/?edit=1&archive=1');

    act(() => result.current.setFlags({ archive: false }));

    expect(result.current.flags).toEqual({ edit: true, archive: false });
  });
});
