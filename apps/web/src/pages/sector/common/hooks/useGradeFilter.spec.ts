import { useState } from 'react';

import type { Topo } from '@crag-atlas/api';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Route } from '../entities';
import { useGradeFilter } from './useGradeFilter';

const route = (id: string, grade: string): Route =>
  ({ id, grade, gradeScale: 'french' }) as Route;

const topo = (id: string, idRoutes: string[]): Topo =>
  ({ id, lines: idRoutes.map((idRoute) => ({ idRoute })) }) as Topo;

const routes = [route('a', '6a'), route('b', '6a'), route('c', '7a')];
const topos = [topo('one', ['a', 'c']), topo('two', ['b'])];

const renderFilter = () =>
  renderHook(() => {
    const [selectedGrades, onSelectGrades] = useState<string[]>([]);

    return useGradeFilter({ routes, topos, selectedGrades, onSelectGrades });
  });

describe('useGradeFilter', () => {
  it('shows the whole sector until a grade is picked', () => {
    const { result } = renderFilter();

    expect(result.current.visibleRoutes).toBe(routes);
    expect(result.current.visibleTopos).toBe(topos);
  });

  it('narrows the routes to the grade picked', () => {
    const { result } = renderFilter();

    act(() => result.current.toggleGrade('french|7a'));

    expect(result.current.visibleRoutes.map(({ id }) => id)).toEqual(['c']);
  });

  it('adds up the grades picked', () => {
    const { result } = renderFilter();

    act(() => result.current.toggleGrade('french|7a'));
    act(() => result.current.toggleGrade('french|6a'));

    expect(result.current.visibleRoutes).toHaveLength(3);
  });

  it('picking the same grade again drops it', () => {
    const { result } = renderFilter();

    act(() => result.current.toggleGrade('french|7a'));
    act(() => result.current.toggleGrade('french|7a'));

    expect(result.current.visibleRoutes).toBe(routes);
  });

  it('keeps only the lines of the routes still shown', () => {
    const { result } = renderFilter();

    act(() => result.current.toggleGrade('french|7a'));

    expect(result.current.visibleTopos).toHaveLength(1);
    expect(
      result.current.visibleTopos[0]?.lines.map(({ idRoute }) => idRoute)
    ).toEqual(['c']);
  });

  it('clears back to the whole sector', () => {
    const { result } = renderFilter();

    act(() => result.current.toggleGrade('french|7a'));
    act(() => result.current.clearGrades());

    expect(result.current.visibleRoutes).toBe(routes);
  });
});
