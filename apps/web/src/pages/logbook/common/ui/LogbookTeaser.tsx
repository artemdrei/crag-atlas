import { Trans } from '@lingui/react/macro';

import { useSignInLink } from '@web/app/router/useSignInLink';
import { SignInTeaser } from '@web/shared/ui';

export interface Props {
  isCompact?: boolean;
}

export const LogbookTeaser = ({ isCompact }: Props) => {
  const { to, from } = useSignInLink();

  return (
    <SignInTeaser
      to={to}
      from={from}
      action="logbook"
      title={<Trans>My logbook</Trans>}
      message={
        <Trans>Your logbook keeps every ascent you have ever logged.</Trans>
      }
      isCompact={isCompact}
    />
  );
};
