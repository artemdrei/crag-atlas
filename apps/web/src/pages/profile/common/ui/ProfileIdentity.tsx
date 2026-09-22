import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { UserAvatar } from '@web/shared/ui';

export interface Props {
  email: string;
  name?: string;
  avatarUrl?: string;
}

export const ProfileIdentity = ({ email, name, avatarUrl }: Props) => (
  <IdentityStyled>
    <AvatarStyled name={name ?? email} avatarUrl={avatarUrl} size={80} />
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

const AvatarStyled = styled(UserAvatar)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;
