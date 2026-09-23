import { Trans } from '@lingui/react/macro';

import { ArchivedNotice } from '@web/shared/ui';

export interface Props {
  className?: string;
}

export const ArchivedRegionNotice = ({ className }: Props) => (
  <ArchivedNotice className={className}>
    <Trans>
      This region is in the archive, so it is out of the catalog. Its sectors,
      routes and everything climbers left on them — ascents, photos, links and
      comments — are still here.
    </Trans>
  </ArchivedNotice>
);
