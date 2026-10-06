import { useCallback, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';

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
import {
  countActiveFilters,
  filterSearchOf,
  rememberSessionFilter,
  sessionFilterOf,
  withFilterSearch
} from '../lib';

export type RouteFilterList = 'routes' | 'region';

const KEYS = ROUTE_FILTER_PARAMS;

const pick = <T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T
): T => options.find((option) => option === value) ?? fallback;

export const useRouteFilter = (list: RouteFilterList) => {
  const { idRegion } = useParams();
  const [urlParams, setParams] = useSearchParams();
  const { isAuthenticated } = useUser();
  const { openModal } = useModal();

  const urlFilter = filterSearchOf(urlParams);
  const sessionFilter = idRegion ? sessionFilterOf(idRegion) : undefined;
  const params =
    sessionFilter === undefined
      ? urlParams
      : new URLSearchParams(sessionFilter);

  // The region and its sectors share one filter for the session: an entry
  // that Back restores carries the filter it was left with, so the session's
  // wins over the address. A first visit is still read from the address.
  useEffect(() => {
    if (!idRegion) return;

    if (sessionFilter === undefined) {
      rememberSessionFilter(idRegion, urlFilter);
    } else if (sessionFilter !== urlFilter) {
      setParams((next) => withFilterSearch(next, sessionFilter), {
        replace: true
      });
    }
  }, [idRegion, sessionFilter, urlFilter, setParams]);

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

  // Replaced, not pushed: Back leaves the screen instead of undoing filters
  // one by one.
  const update = useCallback(
    (entries: Partial<Record<keyof typeof KEYS, string>>) =>
      setParams(
        (next) => {
          const current = idRegion ? sessionFilterOf(idRegion) : undefined;
          if (current !== undefined) withFilterSearch(next, current);

          for (const [field, value] of Object.entries(entries)) {
            const key = KEYS[field as keyof typeof KEYS];

            if (value) next.set(key, value);
            else next.delete(key);
          }

          if (idRegion) rememberSessionFilter(idRegion, filterSearchOf(next));

          return next;
        },
        { replace: true }
      ),
    [idRegion, setParams]
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
