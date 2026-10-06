import { useLingui } from '@lingui/react/macro';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import type { RouteSortDirection } from '../entities';

export interface Props {
  direction: RouteSortDirection;
  isDisabled: boolean;
  onToggleDirection: () => void;
}

export const RoutesSortDirectionButton = ({
  direction,
  isDisabled,
  onToggleDirection
}: Props) => {
  const { t } = useLingui();

  return (
    <ButtonStyled
      disabled={isDisabled}
      startIcon={
        direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
      }
      onClick={onToggleDirection}
    >
      {direction === 'asc' ? t`Ascending` : t`Descending`}
    </ButtonStyled>
  );
};

const ButtonStyled = styled(Button)`
  flex: none;
  text-transform: none;
`;
