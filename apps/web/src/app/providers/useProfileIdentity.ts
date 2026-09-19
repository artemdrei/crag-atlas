import { useUser } from './UserProvider';

/**
 * Google fills user_metadata (under either key, depending on the flow);
 * an email-OTP user has none of it, so only the email is guaranteed.
 */
export const useProfileIdentity = () => {
  const { session } = useUser();
  const metadata = session?.user.user_metadata;

  const email = session?.user.email ?? '';
  const name = (metadata?.full_name ?? metadata?.name) as string | undefined;
  const avatarUrl = (metadata?.avatar_url ?? metadata?.picture) as
    | string
    | undefined;

  return { email, name, avatarUrl, displayName: name ?? email };
};
