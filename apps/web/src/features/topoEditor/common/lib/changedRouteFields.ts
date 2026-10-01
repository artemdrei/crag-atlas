import type { Route } from '@crag-atlas/api';

import type { RouteDraft } from '../entities';
import { typedBolterName } from './typedBolterName';

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
    | 'bolter'
    | 'bolterName'
    | 'boltedYear'
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
  bolter: false,
  bolterName: false,
  boltedYear: false,
  description: false
};

// A route that was never saved has nothing to differ from.
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
    bolter: (draft.bolter?.id ?? null) !== (saved.idBolter ?? null),
    bolterName: draft.bolterName !== typedBolterName(saved),
    boltedYear: draft.boltedYear !== numberText(saved.boltedYear),
    description: draft.description !== (saved.description ?? '')
  };
};

const numberText = (value?: number | null): string =>
  value === null || value === undefined ? '' : String(value);
