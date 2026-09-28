import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { UserAvatar } from '@web/shared/ui';

export interface Props {
  email: string;
  name?: string;
  avatarUrl?: string;
  avatar?: ReactNode;
}

export const ProfileIdentity = ({ email, name, avatarUrl, avatar }: Props) => (
  <IdentityStyled>
    <AvatarSlotStyled>
      {avatar ?? (
        <UserAvatar name={name ?? email} avatarUrl={avatarUrl} size={80} />
      )}
    </AvatarSlotStyled>
    {name && <Typography variant="h6">{name}</Typography>}
    <Typography variant="body2" color="text.secondary">
      {email}
    </Typography>
  </IdentityStyled>
);

const IdentityStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const AvatarSlotStyled = styled('div')`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;
