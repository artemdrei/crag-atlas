import type { PropsWithChildren, ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PageShell } from './PageShell';

export interface Props {
  title: ReactNode;
  actions?: ReactNode;
  onLeave: () => void;
}

export const EditorPageShell = ({
  title,
  actions,
  children,
  onLeave
}: PropsWithChildren<Props>) => {
  return (
    <PageShell spacing={1} isFixedHeight>
      <TopBarStyled>
        <TitleStyled variant="subtitle1">{title}</TitleStyled>
        {actions}
        <Button
          size="small"
          variant="outlined"
          startIcon={<CloseIcon fontSize="small" />}
          onClick={onLeave}
        >
          <Trans>Close the editor</Trans>
        </Button>
      </TopBarStyled>
      {children}
    </PageShell>
  );
};

const TopBarStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const TitleStyled = styled(Typography)`
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
