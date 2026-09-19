import Button from '@mui/material/Button';

import { toast } from '@web/shared/lib';

import { PlaygroundSection } from './PlaygroundSection';

export const ToastPlayground = () => (
  <PlaygroundSection title="Toasts">
    <Button variant="outlined" onClick={() => toast.success('Ascent logged')}>
      success
    </Button>
    <Button
      variant="outlined"
      onClick={() => toast.error('Token has expired or is invalid')}
    >
      error
    </Button>
    <Button variant="outlined" onClick={() => toast.info('Sector updated')}>
      info
    </Button>
    <Button
      variant="outlined"
      onClick={() => toast.warning('Offline — changes are not saved')}
    >
      warning
    </Button>
    <Button
      variant="outlined"
      onClick={() =>
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
          loading: 'Saving…',
          success: 'Saved',
          error: 'Failed'
        })
      }
    >
      promise
    </Button>
  </PlaygroundSection>
);
