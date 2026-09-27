import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

import type { AscentTypeTone } from '@web/shared/theme/palette';
import { resolveAscentTypeInk } from '@web/shared/theme/palette';

import { AscentTypeLabel } from './AscentTypeLabel';

export interface Props {
  ascentType: AscentTypeTone;
  attempts?: number | null;
}

export const AscentTypeBadge = ({ ascentType, attempts }: Props) => (
  <ChipStyled
    size="small"
    variant="outlined"
    label={
      <>
        <AscentTypeLabel ascentType={ascentType} />
        {!!attempts && ` · ${attempts}`}
      </>
    }
    tone={ascentType}
  />
);

const ChipStyled = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: AscentTypeTone }>`
  font-weight: 600;
  background-color: transparent;
  border-color: ${({ theme, tone }) =>
    resolveAscentTypeInk(theme.palette.mode, tone)};
  color: ${({ theme, tone }) => resolveAscentTypeInk(theme.palette.mode, tone)};
`;
