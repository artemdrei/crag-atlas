import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { track } from '@crag-atlas/analytics';

import { useModal, useUser } from '@web/app/providers';
import { trackListControl } from '@web/shared/lib';

import {
  LENGTH_FILTERS,
  type LengthFilter,
  RATING_FILTERS,
  type RatingFilter,
  ROUTE_FILTER_PARAMS,
  ROUTE_SORT_DIRECTIONS,
  ROUTE_SORTS,
  type RouteFilter,
  type RouteSort,
  TICKED_FILTERS,
  type TickedFilter
} from '../entities';
import { countActiveFilters } from '../lib';

export type RouteFilterList = 'routes' | 'region';

const KEYS = ROUTE_FILTER_PARAMS;

const pick = <T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T
): T => options.find((option) => option === value) ?? fallback;

export const useRouteFilter = (list: RouteFilterList) => {
  const [params, setParams] = useSearchParams();
  const { isAuthenticated } = useUser();
  const { openModal } = useModal();

  const rawGrades = params.get(KEYS.grades);
  const rating = pick(params.get(KEYS.rating), RATING_FILTERS, 'any');
  const length = pick(params.get(KEYS.length), LENGTH_FILTERS, 'any');
  const storedTicked = pick(params.get(KEYS.ticked), TICKED_FILTERS, 'any');
  const ticked = isAuthenticated ? storedTicked : 'any';
  const sort = pick(params.get(KEYS.sort), ROUTE_SORTS, 'default');
  const direction = pick(
    params.get(KEYS.direction),
    ROUTE_SORT_DIRECTIONS,
    'desc'
  );

  const filter = useMemo<RouteFilter>(
    () => ({
      grades: rawGrades ? rawGrades.split(',').filter(Boolean) : [],
      rating,
      length,
      ticked
    }),
    [rawGrades, rating, length, ticked]
  );

  // Pushed, not replaced: the address is the filter, so Back steps through.
  const update = useCallback(
    (entries: Partial<Record<keyof typeof KEYS, string>>) =>
      setParams((next) => {
        for (const [field, value] of Object.entries(entries)) {
          const key = KEYS[field as keyof typeof KEYS];

          if (value) next.set(key, value);
          else next.delete(key);
        }

        return next;
      }),
    [setParams]
  );

  const toggleGrade = (key: string) => {
    trackListControl(list, 'grade_filter', key);
    update({
      grades: (filter.grades.includes(key)
        ? filter.grades.filter((one) => one !== key)
        : [...filter.grades, key]
      ).join(',')
    });
  };

  const clearGrades = () => {
    trackListControl(list, 'grade_filter_reset', String(filter.grades.length));
    update({ grades: '' });
  };

  const changeRating = (next: RatingFilter) => {
    trackListControl(list, 'rating_filter', next);
    update({ rating: next === 'any' ? '' : next });
  };

  const changeLength = (next: LengthFilter) => {
    trackListControl(list, 'length_filter', next);
    update({ length: next === 'any' ? '' : next });
  };

  const changeTicked = (next: TickedFilter) => {
    if (!isAuthenticated && next !== 'any') {
      track({ name: 'Sign In Prompted', props: { action: 'filter' } });
      openModal('SIGN_IN_PROMPT');

      return;
    }

    trackListControl(list, 'ascents_filter', next);
    update({ ticked: next === 'any' ? '' : next });
  };

  const changeSort = (next: RouteSort) => {
    trackListControl(list, 'sort', next);
    update({ sort: next === 'default' ? '' : next });
  };

  const toggleDirection = () => {
    const next = direction === 'asc' ? 'desc' : 'asc';

    trackListControl(list, 'sort_direction', next);
    update({ direction: next === 'desc' ? '' : next });
  };

  const clearFilters = () => {
    trackListControl(list, 'filters_reset', String(countActiveFilters(filter)));
    update({ grades: '', rating: '', length: '', ticked: '' });
  };

  return {
    filter,
    sort,
    direction,
    activeCount: countActiveFilters(filter),
    toggleGrade,
    clearGrades,
    changeRating,
    changeLength,
    changeTicked,
    changeSort,
    toggleDirection,
    clearFilters
  };
};

export type RouteFilterState = ReturnType<typeof useRouteFilter>;
