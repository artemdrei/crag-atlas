import { useState } from 'react';

import { trackListControl } from '@web/shared/lib';

import type { AscentFilter, Discipline, TickSort } from '../entities';
import type { LogbookTab } from '../ui';

export const useLogbookControls = () => {
  const [tab, setTab] = useState<LogbookTab>('mine');
  const [discipline, setDiscipline] = useState<Discipline>('sport');
  const [sort, setSort] = useState<TickSort>('grade');
  const [ascentType, setAscentType] = useState<AscentFilter>('all');

  return {
    tab,
    discipline,
    sort,
    ascentType,
    changeTab: (next: LogbookTab) => {
      trackListControl('logbook', 'tab', next);
      setTab(next);
    },
    changeDiscipline: (next: Discipline) => {
      trackListControl('logbook', 'discipline', next);
      setDiscipline(next);
    },
    changeSort: (next: TickSort) => {
      trackListControl('logbook', 'sort', next);
      setSort(next);
    },
    changeAscentType: (next: AscentFilter) => {
      trackListControl('logbook', 'ascent_type', next);
      setAscentType(next);
    }
  };
};
