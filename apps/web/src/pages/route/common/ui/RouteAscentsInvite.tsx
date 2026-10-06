import { Trans } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  isMine: boolean;
  onLog?: () => void;
}

export const RouteAscentsInvite = ({ isMine, onLog }: Props) => (
  <InviteStyled>
    <IconStyled>
      <TaskAltIcon />
    </IconStyled>
    <Typography variant="h6">
      {isMine ? (
        <Trans>Track your progress</Trans>
      ) : (
        <Trans>Log the first ascent</Trans>
      )}
    </Typography>
    <MessageStyled variant="body2">
      {isMine ? (
        <Trans>
          Log your ascent to keep the result, follow your progress and build
          your own grade pyramid.
        </Trans>
      ) : (
        <Trans>
          Your experience helps others judge the quality of the line — and helps
          the community pin down its grade.
        </Trans>
      )}
    </MessageStyled>
    {onLog && (
      <Button
        variant="outlined"
        color="success"
        startIcon={<AddIcon />}
        onClick={onLog}
      >
        <Trans>Log ascent</Trans>
      </Button>
    )}
  </InviteStyled>
);

const InviteStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4, 3)};
  text-align: center;
  color: ${({ theme }) => theme.palette.text.primary};
  background: ${({ theme }) => alpha(theme.palette.success.main, 0.06)};
  border: 1px dashed ${({ theme }) => alpha(theme.palette.success.main, 0.5)};
  border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 1.5}px;
`;

const IconStyled = styled('span')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: ${({ theme }) => theme.palette.success.main};
  background-color: ${({ theme }) => alpha(theme.palette.success.main, 0.12)};

  svg {
    font-size: 32px;
  }
`;

const MessageStyled = styled(Typography)`
  max-width: 340px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;
