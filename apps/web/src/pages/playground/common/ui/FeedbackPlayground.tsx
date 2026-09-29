import {
  domainFailure,
  networkFailure,
  unknownFailure
} from '@crag-atlas/utils';

import { ApiFeedback } from '@web/shared/ui';

import { PlaygroundSection } from './PlaygroundSection';

export const FeedbackPlayground = () => (
  <PlaygroundSection title="ApiFeedback">
    <ApiFeedback
      failure={domainFailure('ROUTE_NOT_FOUND', 'Route "nope" not found')}
    />
    <ApiFeedback failure={networkFailure('fetch failed')} />
    <ApiFeedback failure={unknownFailure('boom')} />
  </PlaygroundSection>
);
