import { Trans } from '@lingui/react/macro';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  rating: number;
  message: string | null;
  authorName: string | null;
}

export const DeleteFeedbackSummary = ({
  rating,
  message,
  authorName
}: Props) => (
  <SummaryStyled>
    <HeaderStyled>
      <Typography variant="body2" component="span">
        {authorName ?? <Trans>Guest</Trans>}
      </Typography>
      <Rating size="small" value={rating} readOnly />
    </HeaderStyled>
    {message && <QuoteStyled variant="body2">{message}</QuoteStyled>}
    <Typography variant="body2" color="text.secondary" component="span">
      <Trans>This cannot be undone.</Trans>
    </Typography>
  </SummaryStyled>
);

const SummaryStyled = styled('span')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: min(420px, 80vw);
`;

const HeaderStyled = styled('span')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const QuoteStyled = styled(Typography)`
  padding: ${({ theme }) => theme.spacing(1, 1.5)};
  border-left: 3px solid ${({ theme }) => theme.palette.divider};
  color: ${({ theme }) => theme.palette.text.primary};
  white-space: pre-wrap;
  overflow-wrap: anywhere;
` as typeof Typography;
