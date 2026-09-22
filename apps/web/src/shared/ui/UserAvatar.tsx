import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

import { getInitials } from '@web/shared/lib';

export interface Props {
  name: string;
  avatarUrl?: string | null;
  /** Edge in pixels; the initials scale with it. */
  size?: number;
  className?: string;
}

/**
 * Someone's picture where there is one — a Google sign-in carries it, an
 * email-OTP user has none — and their initials where there isn't.
 */
export const UserAvatar = ({
  name,
  avatarUrl,
  size = 32,
  className
}: Props) => (
  <AvatarStyled
    className={className}
    size={size}
    src={avatarUrl ?? undefined}
    alt={name}
  >
    {getInitials(name)}
  </AvatarStyled>
);

const AvatarStyled = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;
