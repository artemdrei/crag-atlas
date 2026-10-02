import { Trans } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import AddAPhotoOutlinedIcon from '@mui/icons-material/AddAPhotoOutlined';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  onAdd: () => void;
}

export const RouteMediaInvite = ({ onAdd }: Props) => (
  <InviteStyled>
    <IconStyled>
      <AddAPhotoOutlinedIcon />
    </IconStyled>
    <Typography variant="h6">
      <Trans>Be the first to show this route</Trans>
    </Typography>
    <MessageStyled variant="body2">
      <Trans>
        Your photo or send video helps the next climber read the line — and puts
        your ascent on the route page.
      </Trans>
    </MessageStyled>
    <Button variant="outlined" startIcon={<AddIcon />} onClick={onAdd}>
      <Trans>Add photo or video</Trans>
    </Button>
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
  background: ${({ theme }) => alpha(theme.palette.primary.main, 0.06)};
  border: 1px dashed ${({ theme }) => alpha(theme.palette.primary.main, 0.5)};
  border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 1.5}px;
`;

const IconStyled = styled('span')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};

  svg {
    font-size: 32px;
  }
`;

const MessageStyled = styled(Typography)`
  max-width: 340px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;
