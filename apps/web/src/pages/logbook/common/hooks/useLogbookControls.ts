import { useState } from 'react';

import { trackListControl, useStoredChoice } from '@web/shared/lib';
import {
  DEFAULT_TICK_VIEW,
  type LogbookTab,
  TICK_VIEWS,
  type TickView
} from '@web/widgets/tickList';

import {
  ASCENT_FILTERS,
  type AscentFilter,
  DEFAULT_ASCENT_FILTER,
  DEFAULT_TICK_SORT,
  type Discipline,
  TICK_SORTS,
  type TickSort
} from '../entities';

export const useLogbookControls = () => {
  const [tab, setTab] = useState<LogbookTab>('mine');
  const [discipline, setDiscipline] = useState<Discipline>('sport');
  const [sort, setSort] = useStoredChoice<TickSort>(
    'crag-atlas:logbook-sort',
    TICK_SORTS,
    DEFAULT_TICK_SORT
  );
  const [ascentType, setAscentType] = useStoredChoice<AscentFilter>(
    'crag-atlas:logbook-ascent-type',
    ASCENT_FILTERS,
    DEFAULT_ASCENT_FILTER
  );
  const [view, setView] = useStoredChoice<TickView>(
    'crag-atlas:logbook-view',
    TICK_VIEWS,
    DEFAULT_TICK_VIEW
  );

  return {
    tab,
    discipline,
    sort,
    ascentType,
    view,
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
    },
    changeView: (next: TickView) => {
      trackListControl('logbook', 'view', next);
      setView(next);
    }
  };
};
