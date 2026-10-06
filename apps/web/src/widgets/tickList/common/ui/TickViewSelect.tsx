import { Trans, useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';

import { FilterTextField } from '@web/shared/ui';

import { DEFAULT_TICK_VIEW, type TickView } from '../entities';

export interface Props {
  view: TickView;
  onChange: (view: TickView) => void;
  className?: string;
}

export const TickViewSelect = ({ view, onChange, className }: Props) => {
  const { t } = useLingui();

  return (
    <FilterTextField
      select
      size="small"
      label={t`View`}
      isActive={view !== DEFAULT_TICK_VIEW}
      value={view}
      className={className}
      onChange={(event) => onChange(event.target.value as TickView)}
    >
      <MenuItem value="detailed">
        <Trans>Detailed</Trans>
      </MenuItem>
      <MenuItem value="compact">
        <Trans>Compact</Trans>
      </MenuItem>
    </FilterTextField>
  );
};
