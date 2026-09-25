import { useApiGetRouteMedia } from './useApiGetRouteMedia';

export const useRouteMediaCount = (idRoute: string): number =>
  useApiGetRouteMedia(idRoute).media.length;
