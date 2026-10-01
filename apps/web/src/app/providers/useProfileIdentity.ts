import type { Me } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import { useUser } from './UserProvider';

// Google fills user_metadata under either key; an email-OTP user has none, so
// only the email is guaranteed. The picture comes from `/me`: the metadata is
// the placeholder until it lands, never a fallback after — once `/me` has
// spoken, a null is a removed photo.
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
