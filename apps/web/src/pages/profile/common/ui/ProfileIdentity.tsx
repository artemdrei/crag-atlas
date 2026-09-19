import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { getInitials } from '@web/shared/lib';

export interface Props {
  email: string;
  name?: string;
  avatarUrl?: string;
}

export const ProfileIdentity = ({ email, name, avatarUrl }: Props) => (
  <IdentityStyled>
    {/* Google sign-ins carry a name and picture; email-OTP users have neither,
        so the avatar falls back to initials. */}
    <AvatarStyled src={avatarUrl} alt={name ?? email}>
      {getInitials(name ?? email)}
    </AvatarStyled>
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

const AvatarStyled = styled(Avatar)`
  width: 80px;
  height: 80px;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;
