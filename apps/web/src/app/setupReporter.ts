import {
  isFailure,
  resolveFailureMessage,
  setReporterSink
} from '@crag-atlas/utils';

import { toast } from '@web/shared/lib';

// Wires the shared no-op reporter to a visible signal for THIS app.
// Only 'unknown' failures toast — 'domain'/'validation' are already shown
// inline (ApiFeedback etc.), 'network' isn't reported at all (wrapApiCall's
// own choice). Swapping in real monitoring later means adding a call here,
// not touching any call site that reports errors.
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
