import type { PropsWithChildren, ReactNode } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PageShell } from './PageShell';

export interface Props {
  backLabel: string;
  title: ReactNode;
  onLeave: () => void;
}

/** The chrome every editor screen wears: a way back, the editor badge, what is
    being edited, and a way out. */
export const EditorPageShell = ({
  backLabel,
  title,
  children,
  onLeave
}: PropsWithChildren<Props>) => {
  const { t } = useLingui();

  return (
    <PageShell spacing={1} isFixedHeight>
      <TopBarStyled>
        <IconButton aria-label={backLabel} onClick={onLeave}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={t`Editor`}
        />
        <TitleStyled variant="subtitle1">{title}</TitleStyled>
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
