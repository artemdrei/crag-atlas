import { Trans } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

import type { FilterChip } from '../hooks';

export interface Props {
  chips: FilterChip[];
  onClearAll?: () => void;
}

export const ActiveFilterChips = ({ chips, onClearAll }: Props) => {
  if (chips.length === 0) return null;

  return (
    <RowStyled>
      {chips.map(({ key, label, onRemove }) => (
        <Chip
          key={key}
          size="small"
          label={label}
          onClick={onRemove}
          onDelete={onRemove}
        />
      ))}
      {onClearAll && (
        <ClearButtonStyled
          size="small"
          variant="outlined"
          color="inverse"
          startIcon={<CloseIcon />}
          onClick={onClearAll}
        >
          <Trans>Clear all filters</Trans>
        </ClearButtonStyled>
      )}
    </RowStyled>
  );
};

const RowStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
`;

const ClearButtonStyled = styled(Button)`
  margin-left: auto;
  text-transform: none;
`;
