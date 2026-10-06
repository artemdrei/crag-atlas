import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useStoredChoice } from './useStoredChoice';

const KEY = 'test:choice';
const CHOICES = ['grade', 'date'] as const;

describe('useStoredChoice', () => {
  beforeEach(() => localStorage.clear());

  it('starts from the fallback when nothing is stored', () => {
    const { result } = renderHook(() => useStoredChoice(KEY, CHOICES, 'grade'));

    expect(result.current[0]).toBe('grade');
  });

  it('restores the stored choice', () => {
    localStorage.setItem(KEY, 'date');

    const { result } = renderHook(() => useStoredChoice(KEY, CHOICES, 'grade'));

    expect(result.current[0]).toBe('date');
  });

  it('ignores a stored value that is no longer a choice', () => {
    localStorage.setItem(KEY, 'rating');

    const { result } = renderHook(() => useStoredChoice(KEY, CHOICES, 'grade'));

    expect(result.current[0]).toBe('grade');
  });

  it('remembers a change', () => {
    const { result } = renderHook(() => useStoredChoice(KEY, CHOICES, 'grade'));

    act(() => result.current[1]('date'));

    expect(result.current[0]).toBe('date');
    expect(localStorage.getItem(KEY)).toBe('date');
  });
});
