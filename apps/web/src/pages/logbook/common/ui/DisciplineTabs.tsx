import { Trans } from '@lingui/react/macro';

import { PillTabs } from '@web/shared/ui';

import type { Discipline } from '../entities';

export interface Props {
  discipline: Discipline;
  sportCount?: number;
  boulderCount?: number;
  onChange: (discipline: Discipline) => void;
}

export const DisciplineTabs = ({
  discipline,
  sportCount,
  boulderCount,
  onChange
}: Props) => (
  <PillTabs
    value={discipline}
    options={[
      {
        value: 'sport',
        label: (
          <>
            <Trans>Sport</Trans>
            {sportCount !== undefined && ` · ${sportCount}`}
          </>
        )
      },
      {
        value: 'boulder',
        label: (
          <>
            <Trans>Bouldering</Trans>
            {boulderCount !== undefined && ` · ${boulderCount}`}
          </>
        )
      }
    ]}
    onChange={onChange}
  />
);
