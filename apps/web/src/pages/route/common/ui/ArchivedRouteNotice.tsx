import { Trans } from '@lingui/react/macro';

import { ArchivedNotice } from '@web/shared/ui';

export interface Props {
  className?: string;
}

export const ArchivedRouteNotice = ({ className }: Props) => (
  <ArchivedNotice className={className}>
    <Trans>
      This route is in the archive, so it is out of the catalog. Everything
      climbers left on it — ascents, photos, links and comments — is still here.
    </Trans>
  </ArchivedNotice>
);
