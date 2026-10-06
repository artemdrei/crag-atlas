import { useState } from 'react';

import type { SectorQr } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import { useTheme } from '@mui/material/styles';

import { toast } from '@web/shared/lib';
import { fontFamily } from '@web/shared/theme/typography';

import { downloadQrPlaques } from './lib';

export const useDownloadQrPlaques = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const [isPending, setIsPending] = useState(false);

  const download = async (rows: SectorQr[], fileName: string) => {
    setIsPending(true);

    try {
      await downloadQrPlaques({
        rows,
        origin: window.location.origin,
        fileName,
        style: {
          ink: theme.palette.common.black,
          paper: theme.palette.common.white,
          cutLine: theme.palette.grey[400],
          titleFont: fontFamily.display,
          subtitleFont: fontFamily.body
        }
      });
    } catch {
      toast.error(t`The PDF could not be built`);
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, download };
};
