import type { Feedback } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { UserAvatar } from '@web/shared/ui';

const AVATAR_SIZE = 32;

export interface Props {
  entry: Feedback;
}

export const FeedbackAuthor = ({ entry }: Props) => (
  <AuthorStyled>
    <UserAvatar
      name={entry.authorName ?? entry.email ?? '?'}
      avatarUrl={entry.avatarUrl ?? undefined}
      size={AVATAR_SIZE}
    />
    <IdentityStyled>
      <Typography variant="body2" noWrap>
        {entry.authorName ?? <Trans>Guest</Trans>}
      </Typography>
      {entry.email && (
        <EmailStyled
          variant="caption"
          color="text.secondary"
          component="a"
          href={`mailto:${entry.email}`}
          noWrap
        >
          {entry.email}
        </EmailStyled>
      )}
    </IdentityStyled>
  </AuthorStyled>
);

const AuthorStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;

const IdentityStyled = styled('div')`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const EmailStyled = styled(Typography)`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
` as typeof Typography;
