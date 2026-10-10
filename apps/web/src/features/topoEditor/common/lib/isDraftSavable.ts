import { isNameLatin } from '@web/shared/lib';

import type { RouteDraft } from '../entities';

export const isDraftSavable = (draft: RouteDraft): boolean =>
  !!draft.name.trim() &&
  !!draft.nameLocal.trim() &&
  isNameLatin(draft.name) &&
  !!draft.grade;
