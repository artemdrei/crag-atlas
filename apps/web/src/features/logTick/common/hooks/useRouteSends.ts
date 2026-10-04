import { toRouteSends } from '../lib';
import { useApiGetMyRouteTicks } from './useApiGetMyRouteTicks';

export const useRouteSends = (idRoute: string) =>
  toRouteSends(useApiGetMyRouteTicks(idRoute).ticks);
