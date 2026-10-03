import { useMemo, useState } from 'react';

import type { ConditionsDay, SectorConditions } from '../entities';

export const useSelectedDay = (conditions: SectorConditions | null) => {
  const [date, selectDate] = useState<string | null>(null);

  const day: ConditionsDay | null = useMemo(() => {
    const days = conditions?.days ?? [];

    return days.find((entry) => entry.date === date) ?? days[0] ?? null;
  }, [conditions, date]);

  return { day, selectDate };
};
