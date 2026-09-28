import type { Route } from '@crag-atlas/api';

import type { RouteDraft } from '../entities';

export type ChangedRouteFields = {
  [K in keyof Pick<
    RouteDraft,
    | 'name'
    | 'nameLocal'
    | 'grade'
    | 'gradeScale'
    | 'type'
    | 'length'
    | 'boltsCount'
    | 'description'
  >]: boolean;
};

const NOTHING_CHANGED: ChangedRouteFields = {
  name: false,
  nameLocal: false,
  grade: false,
  gradeScale: false,
  type: false,
  length: false,
  boltsCount: false,
  description: false
};

/** Which fields a draft no longer agrees with the server on; a route that was never saved has nothing to differ from. */
export const changedRouteFields = (
  draft: RouteDraft,
  saved?: Route
): ChangedRouteFields => {
  if (draft.isNew || !saved) return NOTHING_CHANGED;

  return {
    name: draft.name !== saved.name,
    nameLocal: draft.nameLocal !== (saved.nameLocal ?? ''),
    grade: draft.grade !== saved.grade,
    gradeScale: draft.gradeScale !== saved.gradeScale,
    type: draft.type !== saved.type,
    length: draft.length !== numberText(saved.length),
    boltsCount: draft.boltsCount !== numberText(saved.boltsCount),
    description: draft.description !== (saved.description ?? '')
  };
};

// The draft holds what the inputs show, and an absent number shows as empty.
const numberText = (value?: number | null): string =>
  value === null || value === undefined ? '' : String(value);
