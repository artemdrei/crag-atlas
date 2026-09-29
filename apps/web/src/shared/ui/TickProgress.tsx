import { useLingui } from '@lingui/react/macro';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { resolveAscentTypeInk } from '../theme/palette';

export interface Props {
  className?: string;
  tickedCount: number;
  routesCount: number;
}

export const TickProgress = ({
  className,
  tickedCount,
  routesCount
}: Props) => {
  const { t } = useLingui();

  if (!routesCount) return null;

  return (
    <RowStyled className={className} title={t`Routes you have climbed here`}>
      <BarStyled
        variant="determinate"
        value={(tickedCount / routesCount) * 100}
      />
      <CountStyled variant="caption" color="text.secondary">
        {tickedCount}/{routesCount}
      </CountStyled>
    </RowStyled>
  );
};

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const BarStyled = styled(LinearProgress)`
  position: relative;
  top: -1px;
  flex: 1;
  min-width: 32px;
  height: 3px;
  border-radius: 2px;
  background: ${({ theme }) => alpha(theme.palette.text.primary, 0.12)};

  & .MuiLinearProgress-bar {
    border-radius: 2px;
    background: ${({ theme }) =>
      resolveAscentTypeInk(theme.palette.mode, 'onsight')};
  }
`;

const CountStyled = styled(Typography)`
  flex: none;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
` as typeof Typography;
