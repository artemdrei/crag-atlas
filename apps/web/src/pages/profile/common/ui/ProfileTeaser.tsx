import { Trans } from '@lingui/react/macro';

import { useSignInLink } from '@web/app/router/useSignInLink';
import { SignInTeaser } from '@web/shared/ui';

export const ProfileTeaser = () => {
  const { to, from } = useSignInLink();

  return (
    <SignInTeaser
      to={to}
      from={from}
      action="profile"
      title={<Trans>Profile</Trans>}
      message={
        <Trans>
          Your account keeps your logbook, your beta and your settings in one
          place.
        </Trans>
      }
    />
  );
};
