import type { GradeScale } from '@crag-atlas/api';

import { useDisplayGrade } from '@web/shared/lib';

import type { RouteFilterState } from './useRouteFilter';
import { useRouteFilterLabels } from './useRouteFilterLabels';

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export const useFilterChips = (
  state: RouteFilterState,
  gradeOrder: Record<string, number>
): FilterChip[] => {
  const displayGrade = useDisplayGrade();
  const labels = useRouteFilterLabels();
  const { filter } = state;

  const grades = [...filter.grades]
    .sort((one, other) => (gradeOrder[one] ?? 0) - (gradeOrder[other] ?? 0))
    .map((key) => {
      const [scale = '', grade = ''] = key.split('|');

      return displayGrade(grade, scale as GradeScale);
    });

  return [
    grades.length > 0 && {
      key: 'grades',
      label:
        grades.length === 1
          ? (grades[0] ?? '')
          : `${grades[0]}–${grades[grades.length - 1]}`,
      onRemove: state.clearGrades
    },
    filter.rating !== 'any' && {
      key: 'rating',
      label: labels.rating[filter.rating],
      onRemove: () => state.changeRating('any')
    },
    filter.length !== 'any' && {
      key: 'length',
      label: labels.length[filter.length],
      onRemove: () => state.changeLength('any')
    },
    filter.ticked !== 'any' && {
      key: 'ticked',
      label: labels.ticked[filter.ticked],
      onRemove: () => state.changeTicked('any')
    }
  ].filter((chip): chip is FilterChip => !!chip);
};
