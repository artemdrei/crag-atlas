import Button from '@mui/material/Button';

import { useModal } from '@web/app/providers';

import { PlaygroundSection } from './PlaygroundSection';

export const ModalPlayground = () => {
  const { openModal } = useModal();

  return (
    <PlaygroundSection title="Modal (dialog on desktop, bottom sheet on mobile)">
      <Button
        variant="outlined"
        onClick={() => openModal('PLAYGROUND_DEMO', { title: 'Demo modal' })}
      >
        open
      </Button>
    </PlaygroundSection>
  );
};
