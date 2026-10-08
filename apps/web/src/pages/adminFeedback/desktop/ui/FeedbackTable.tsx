import type { Feedback } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { formatDateTime } from '@web/shared/lib';

import { DeleteFeedbackButton, FeedbackAuthor } from '../../common';

export interface Props {
  feedback: Feedback[];
}

export const FeedbackTable = ({ feedback }: Props) => {
  const { i18n } = useLingui();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <Trans>When</Trans>
          </TableCell>
          <TableCell>
            <Trans>Rating</Trans>
          </TableCell>
          <TableCell>
            <Trans>Message</Trans>
          </TableCell>
          <TableCell>
            <Trans>From</Trans>
          </TableCell>
          <TableCell>
            <Trans>Where</Trans>
          </TableCell>
          <TableCell padding="checkbox" />
        </TableRow>
      </TableHead>
      <TableBody>
        {feedback.map((entry) => (
          <RowStyled key={entry.id} hover>
            <NoWrapCellStyled>
              {formatDateTime(entry.createdAt, i18n.locale)}
            </NoWrapCellStyled>
            <NoWrapCellStyled>
              <Rating size="small" value={entry.rating} readOnly />
            </NoWrapCellStyled>
            <TableCell>
              <MessageStyled variant="body2">
                {entry.message ?? '—'}
              </MessageStyled>
            </TableCell>
            <TableCell>
              <FeedbackAuthor entry={entry} />
            </TableCell>
            <TableCell>
              <Typography variant="caption" color="text.secondary">
                {entry.url}
                <br />
                {entry.platform} · v{entry.appVersion}
              </Typography>
            </TableCell>
            <TableCell padding="checkbox">
              <DeleteStyled entry={entry} />
            </TableCell>
          </RowStyled>
        ))}
      </TableBody>
    </Table>
  );
};

const DeleteStyled = styled(DeleteFeedbackButton)`
  opacity: 0;
  transition: opacity 0.15s ease-out;

  &:focus-visible {
    opacity: 1;
  }
`;

const RowStyled = styled(TableRow)`
  &:hover .MuiIconButton-root {
    opacity: 1;
  }
`;

const NoWrapCellStyled = styled(TableCell)`
  white-space: nowrap;
  vertical-align: top;
`;

const MessageStyled = styled(Typography)`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;
