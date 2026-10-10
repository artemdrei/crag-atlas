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
    <Typography variant="subtitle1">{summary}</Typography>
    <ClearButtonStyled
      size="small"
      variant="text"
      color="inherit"
      startIcon={<CloseIcon fontSize="small" />}
      isVisible={isActive}
      disabled={!isActive}
      onClick={onClearAll}
    >
      <Trans>Reset</Trans>
    </ClearButtonStyled>
  </RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ClearButtonStyled = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})<{ isVisible: boolean }>`
  flex-shrink: 0;
  margin-left: auto;
  text-transform: none;
  white-space: nowrap;
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
`;
