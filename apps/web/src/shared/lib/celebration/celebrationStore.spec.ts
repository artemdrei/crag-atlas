import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { celebrate, endCelebration, useCelebration } from './celebrationStore';

describe('celebration store', () => {
  afterEach(() => act(() => endCelebration()));

  it('plays one celebration at a time', () => {
    const { result } = renderHook(() => useCelebration());

    expect(result.current).toBeNull();

    act(() => celebrate('confetti'));
    expect(result.current).toBe('confetti');

    act(() => endCelebration());
    expect(result.current).toBeNull();
  });

  it('ignores a trigger while one is still playing', () => {
    const { result } = renderHook(() => useCelebration());

    act(() => celebrate('confetti'));
    act(() => celebrate('confetti'));

    expect(result.current).toBe('confetti');
  });
});
