import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';

import { track } from '@crag-atlas/analytics';

import { buildSectorPath } from '@web/app/router/routes';
import { useApiResolveQrPath } from '@web/features/sectorQr';

export const useQrRedirect = () => {
  const { '*': path = '' } = useParams();
  const { target, isLoading, failure } = useApiResolveQrPath(path);
  const isMissing = !!failure || (!isLoading && !target);
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (trackedPath.current === path || (!target && !isMissing)) return;

    trackedPath.current = path;
    track({
      name: 'QR Code Scanned',
      props: target
        ? {
            result: 'opened',
            qr_path: path,
            id_region: target.idRegion,
            id_sector: target.idSector,
            region_name: target.regionName,
            sector_name: target.sectorName
          }
        : { result: 'not_found', qr_path: path }
    });
  }, [path, target, isMissing]);

  return {
    sectorPath: target
      ? buildSectorPath(target.idRegion, target.idSector)
      : null,
    isLoading,
    isMissing
  };
};
