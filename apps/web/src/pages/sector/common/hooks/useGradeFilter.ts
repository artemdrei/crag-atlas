import { useCallback, useMemo } from 'react';

import type { Topo } from '@crag-atlas/api';

import { gradeKey, trackListControl } from '@web/shared/lib';

import type { Route } from '../entities';

export interface Params {
  routes: Route[];
  topos: Topo[];
  selectedGrades: string[];
  onSelectGrades: (keys: string[]) => void;
}

export const useGradeFilter = ({
  routes,
  topos,
  selectedGrades,
  onSelectGrades
}: Params) => {
  const toggleGrade = useCallback(
    (key: string) => {
      trackListControl('routes', 'grade_filter', key);
      onSelectGrades(
        selectedGrades.includes(key)
          ? selectedGrades.filter((one) => one !== key)
          : [...selectedGrades, key]
      );
    },
    [selectedGrades, onSelectGrades]
  );

  const clearGrades = useCallback(() => {
    trackListControl(
      'routes',
      'grade_filter_reset',
      String(selectedGrades.length)
    );
    onSelectGrades([]);
  }, [selectedGrades, onSelectGrades]);

  const visibleRoutes = useMemo(() => {
    if (selectedGrades.length === 0) return routes;

    return routes.filter((route) =>
      selectedGrades.includes(gradeKey(route.grade, route.gradeScale))
    );
  }, [routes, selectedGrades]);

  const visibleTopos = useMemo(() => {
    if (selectedGrades.length === 0) return topos;

    const visible = new Set(visibleRoutes.map(({ id }) => id));

    return topos
      .map((topo) => ({
        ...topo,
        lines: topo.lines.filter((line) => visible.has(line.idRoute))
      }))
      .filter(({ lines }) => lines.length > 0);
  }, [topos, visibleRoutes, selectedGrades]);

  return { toggleGrade, clearGrades, visibleRoutes, visibleTopos };
};
