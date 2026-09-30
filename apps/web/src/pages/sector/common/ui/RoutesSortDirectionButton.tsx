import { useLingui } from '@lingui/react/macro';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

import type { RouteSortDirection } from '../entities';

export interface Props {
  direction: RouteSortDirection;
  isVisible: boolean;
  onToggleDirection: () => void;
}

export const RoutesSortDirectionButton = ({
  direction,
  isVisible,
  onToggleDirection
}: Props) => {
  const { t } = useLingui();

  return (
    <ButtonStyled
      size="small"
      isVisible={isVisible}
      disabled={!isVisible}
      aria-label={direction === 'asc' ? t`Ascending` : t`Descending`}
      onClick={onToggleDirection}
    >
      {direction === 'asc' ? (
        <ArrowUpwardIcon fontSize="small" />
      ) : (
        <ArrowDownwardIcon fontSize="small" />
      )}
    </ButtonStyled>
  );
};

// The slot keeps its width while no sort is picked, so turning one on does not
// shove the bars sideways.
const ButtonStyled = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})<{ isVisible: boolean }>`
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  color: ${({ theme }) => theme.palette.text.secondary};
`;
