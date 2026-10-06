import { useParams } from 'react-router';

import { buildSectorPath } from '@web/app/router/routes';
import { useApiResolveQrPath } from '@web/features/sectorQr';

export const useQrRedirect = () => {
  const { '*': path = '' } = useParams();
  const { target, isLoading, failure } = useApiResolveQrPath(path);

  return {
    sectorPath: target
      ? buildSectorPath(target.idRegion, target.idSector)
      : null,
    isLoading,
    isMissing: !!failure || (!isLoading && !target)
  };
};
