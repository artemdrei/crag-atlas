import { Trans } from '@lingui/react/macro';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const FeedbackSent = () => (
  <SentStyled role="status">
    <IconStyled />
    <Typography variant="h6">
      <Trans>Thank you!</Trans>
    </Typography>
    <Typography variant="body2" color="text.secondary">
      <Trans>Your feedback has been sent.</Trans>
    </Typography>
  </SentStyled>
);

const SentStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(4, 2)};
  text-align: center;
`;

const IconStyled = styled(CheckCircleOutlinedIcon)`
  font-size: 56px;
  color: ${({ theme }) => theme.palette.success.main};
`;
