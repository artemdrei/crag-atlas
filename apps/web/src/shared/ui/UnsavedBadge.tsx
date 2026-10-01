import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// The holder needs `position: relative` and no clipping.
export const UnsavedBadge = () => (
  <BadgeStyled variant="caption">
    <Trans>Unsaved</Trans>
  </BadgeStyled>
);

const BadgeStyled = styled(Typography)`
  position: absolute;
  top: 0;
  right: ${({ theme }) => theme.spacing(1.5)};
  transform: translateY(-50%);
  padding: 0 ${({ theme }) => theme.spacing(0.75)};
  border-radius: 999px;
  background: ${({ theme }) => theme.palette.warning.main};
  color: ${({ theme }) => theme.palette.warning.contrastText};
  line-height: 1.4;
  white-space: nowrap;
`;
