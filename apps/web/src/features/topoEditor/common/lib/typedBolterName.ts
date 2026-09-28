import type { Route } from '@crag-atlas/api';

// `bolterName` on a saved route is whoever bolted it, from either source; the
// draft's own field is the typed name alone, so a picked climber leaves it
// empty.
export const typedBolterName = (route: Route): string =>
  route.idBolter ? '' : (route.bolterName ?? '');
