import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

import { getInitials } from '@web/shared/lib';

export interface Props {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  maxInitials?: number;
  className?: string;
}

// MUI sizes the letter for its own 40px default, so a small circle gets a
// letter too big to sit inside it.
const INITIALS_RATIO = 0.5;

export const UserAvatar = ({
  name,
  avatarUrl,
  size = 32,
  maxInitials = 2,
  className
}: Props) => (
  <AvatarStyled
    className={className}
    size={size}
    src={avatarUrl ?? undefined}
    alt={name}
  >
    {getInitials(name, maxInitials)}
  </AvatarStyled>
);

const AvatarStyled = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size: number }>`
  /* A fixed-size circle has no business squashing into an oval when a flex
     row runs short of room. */
  flex-shrink: 0;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  font-size: ${({ size }) => size * INITIALS_RATIO}px;
`;
