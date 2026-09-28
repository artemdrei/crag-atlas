import type { Me } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import { useUser } from './UserProvider';

/**
 * Google fills user_metadata (under either key, depending on the flow);
 * an email-OTP user has none of it, so only the email is guaranteed.
 *
 * The picture comes from `/me`, not from the session: a climber who uploaded
 * their own would otherwise keep seeing the provider's here while everyone
 * else — comments, ticks, the logbook — sees theirs. The metadata is the
 * placeholder until that answer lands, and never a fallback after it: once
 * `/me` has spoken, a null is a removed photo, and reviving the provider's
 * URL would make "Remove photo" look broken.
 */
export const useProfileIdentity = () => {
  const { session, isAuthenticated } = useUser();
  const metadata = session?.user.user_metadata;

  const { data: me } = useApiQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => apiGet<Me>('/me'),
    enabled: isAuthenticated
  });

  const email = session?.user.email ?? '';
  const name = (metadata?.full_name ?? metadata?.name) as string | undefined;
  const sessionAvatarUrl = (metadata?.avatar_url ?? metadata?.picture) as
    | string
    | undefined;

  const avatarUrl = me ? (me.avatarUrl ?? undefined) : sessionAvatarUrl;

  return { email, name, avatarUrl, displayName: name ?? email };
};
