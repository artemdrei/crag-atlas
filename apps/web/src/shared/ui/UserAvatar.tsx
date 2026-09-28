import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

import { getInitials } from '@web/shared/lib';

export interface Props {
  name: string;
  avatarUrl?: string | null;
  /** Edge in pixels; the initials scale with it. */
  size?: number;
  maxInitials?: number;
  className?: string;
}

// MUI sizes the letter for its own 40px default and never looks at ours, so
// a small circle gets a letter too big to sit inside it. Half the edge is
// what leaves a ring of space around a capital.
const INITIALS_RATIO = 0.5;

/**
 * Someone's picture where there is one — a Google sign-in carries it, an
 * email-OTP user has none — and their initials where there isn't.
 */
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
