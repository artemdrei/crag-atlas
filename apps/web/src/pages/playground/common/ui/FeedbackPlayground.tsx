import {
  domainFailure,
  networkFailure,
  unknownFailure
} from '@crag-atlas/utils';

import { ApiFeedback } from '@web/shared/ui';

import { PlaygroundSection } from './PlaygroundSection';

export const FeedbackPlayground = () => (
  <PlaygroundSection title="ApiFeedback">
    <ApiFeedback isLoading failure={null} loadingLabel="Loading routes…" />
    <ApiFeedback
      isLoading={false}
      failure={domainFailure('ROUTE_NOT_FOUND', 'Route "nope" not found')}
      loadingLabel=""
    />
    <ApiFeedback
      isLoading={false}
      failure={networkFailure('fetch failed')}
      loadingLabel=""
    />
    <ApiFeedback
      isLoading={false}
      failure={unknownFailure('boom')}
      loadingLabel=""
    />
  </PlaygroundSection>
);
