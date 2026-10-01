import {
  isFailure,
  resolveFailureMessage,
  setReporterSink
} from '@crag-atlas/utils';

import { toast } from '@web/shared/lib';

// Only 'unknown' failures toast: 'domain'/'validation' are already shown
// inline, and 'network' is never reported.
export const setupReporter = () => {
  setReporterSink({
    error: (error) => {
      if (isFailure(error) && error.kind === 'unknown') {
        toast.error(resolveFailureMessage(error));
      }
    },
    warn: () => {},
    info: () => {}
  });
};
