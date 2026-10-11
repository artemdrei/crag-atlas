import { Trans } from '@lingui/react/macro';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  routeName: string;
  onOpen?: () => void;
}

export const VideoExistsNotice = ({ routeName, onOpen }: Props) => (
  <NoticeStyled role="alert">
    <ErrorOutlineOutlinedIcon fontSize="small" color="warning" />
    <TextStyled variant="body2">
      <Trans>This video is already on {routeName}</Trans>
    </TextStyled>
    {onOpen && (
      <Button size="small" color="warning" onClick={onOpen}>
        <Trans>Open</Trans>
      </Button>
    )}
  </NoticeStyled>
);

const NoticeStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 1.5)};
  border: 1px solid ${({ theme }) => alpha(theme.palette.warning.main, 0.4)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => alpha(theme.palette.warning.main, 0.08)};
`;

const TextStyled = styled(Typography)`
  flex: 1 1 auto;
  min-width: 0;
`;
