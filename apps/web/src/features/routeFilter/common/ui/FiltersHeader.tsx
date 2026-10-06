import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  summary?: ReactNode;
  isActive: boolean;
  onClearAll: () => void;
}

export const FiltersHeader = ({ summary, isActive, onClearAll }: Props) => (
  <RowStyled>
    <Typography variant="subtitle1">
      <Trans>Filters</Trans>
      {summary && <SummaryStyled> · {summary}</SummaryStyled>}
    </Typography>
    <ClearButtonStyled
      size="small"
      variant="outlined"
      color="inverse"
      startIcon={<CloseIcon />}
      isVisible={isActive}
      disabled={!isActive}
      onClick={onClearAll}
    >
      <Trans>Clear all filters</Trans>
    </ClearButtonStyled>
  </RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SummaryStyled = styled('span')`
  font-weight: 400;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ClearButtonStyled = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})<{ isVisible: boolean }>`
  margin-left: auto;
  text-transform: none;
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
`;
