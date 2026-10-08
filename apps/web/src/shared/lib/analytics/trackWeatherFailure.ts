import { track } from '@crag-atlas/analytics';

import { failureCodeOf } from './failureCodeOf';

export const trackWeatherFailure = (
  context: 'conditions' | 'tick',
  provider: string,
  error: unknown
) =>
  track({
    name: 'Weather Load Failed',
    props: { context, code: failureCodeOf(error), provider }
  });
