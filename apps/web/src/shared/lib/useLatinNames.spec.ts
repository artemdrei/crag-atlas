import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { loadTransliteration } from './toLatin';
import { useLatinNames } from './useLatinNames';

const ready = async () => {
  const { result } = renderHook(() => useLatinNames());

  await waitFor(() => expect(result.current).toBeTruthy());

  return result;
};

describe('useLatinNames', () => {
  beforeAll(() => loadTransliteration());

  it('fills the Latin name from the local one', async () => {
    const result = await ready();

    act(() => result.current.setNameLocal('Денеші'));

    expect(result.current.name).toBe('Deneshi');
    expect(result.current.nameLocal).toBe('Денеші');
  });

  it('lands on the last keystroke when several are typed in a row', async () => {
    const result = await ready();

    act(() => result.current.setNameLocal('Ден'));
    act(() => result.current.setNameLocal('Денеші'));

    expect(result.current.nameLocal).toBe('Денеші');
    expect(result.current.name).toBe('Deneshi');
  });

  it('leaves a Latin name somebody wrote themselves alone', async () => {
    const { result } = renderHook(() => useLatinNames('Denesh', 'Денеші'));

    await waitFor(() => expect(result.current.name).toBe('Denesh'));
    act(() => result.current.setNameLocal('Денеші!'));

    expect(result.current.nameLocal).toBe('Денеші!');
    expect(result.current.name).toBe('Denesh');
  });
});
