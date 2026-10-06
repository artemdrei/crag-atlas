import { useLingui } from '@lingui/react/macro';

import type { QrWarning } from '../lib';

export const useQrWarningLabels = (): Record<QrWarning, string> => {
  const { t } = useLingui();

  return {
    noCountry: t`The region has no country, so it cannot get a QR code`,
    noPath: t`No QR code yet`,
    noLocalName: t`No Ukrainian name: the plaque shows only the Latin one`,
    numberedSlug: t`The address is numbered: another sector has the same name`,
    longName: t`The name is long and prints small`,
    archived: t`The sector is archived`
  };
};
