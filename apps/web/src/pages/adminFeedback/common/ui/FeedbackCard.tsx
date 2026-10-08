import type { Feedback } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { formatDateTime } from '@web/shared/lib';

import { DeleteFeedbackButton } from './DeleteFeedbackButton';
import { FeedbackAuthor } from './FeedbackAuthor';

export interface Props {
  entry: Feedback;
}

export const FeedbackCard = ({ entry }: Props) => {
  const { i18n } = useLingui();

  return (
    <CardStyled elevation={0}>
      <HeaderStyled>
        <FeedbackAuthor entry={entry} />
        <ActionsStyled>
          <Rating size="small" value={entry.rating} readOnly />
          <DeleteFeedbackButton entry={entry} />
        </ActionsStyled>
      </HeaderStyled>
      {entry.message && (
        <MessageStyled variant="body2">{entry.message}</MessageStyled>
      )}
      <MetaStyled variant="caption" color="text.secondary">
        {formatDateTime(entry.createdAt, i18n.locale)} · {entry.url} ·{' '}
        {entry.platform} · v{entry.appVersion}
      </MetaStyled>
    </CardStyled>
  );
};

const CardStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const HeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const ActionsStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const MessageStyled = styled(Typography)`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const MetaStyled = styled(Typography)`
  overflow-wrap: anywhere;
`;
