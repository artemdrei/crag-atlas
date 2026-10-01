import type { Admin } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { UserAvatar } from '@web/shared/ui';

const AVATAR_SIZE = 40;

export interface Props {
  admin: Admin;
  isMe: boolean;
  isRevoking: boolean;
  onRevoke: (idUser: string) => void;
}

export const AdminRow = ({ admin, isMe, isRevoking, onRevoke }: Props) => (
  <RowStyled elevation={0}>
    <UserAvatar
      name={admin.displayName}
      avatarUrl={admin.avatarUrl ?? undefined}
      size={AVATAR_SIZE}
    />
    <IdentityStyled>
      <NameStyled>
        <Typography variant="body1" noWrap>
          {admin.displayName}
        </Typography>
        {isMe && <Chip size="small" label={<Trans>It's you</Trans>} />}
      </NameStyled>
      <Typography variant="body2" color="text.secondary" noWrap>
        {admin.email}
      </Typography>
    </IdentityStyled>
    {!isMe && (
      <Button
        color="inherit"
        disabled={isRevoking}
        onClick={() => onRevoke(admin.idUser)}
      >
        <Trans>Revoke access</Trans>
      </Button>
    )}
  </RowStyled>
);

const RowStyled = styled(Paper)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const IdentityStyled = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
`;

const NameStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;
