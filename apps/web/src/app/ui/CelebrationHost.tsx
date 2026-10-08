import { Suspense } from 'react';

import { endCelebration, useCelebration } from '@web/shared/lib';
import { LottieOverlay } from '@web/shared/ui';

export const CelebrationHost = () => {
  const name = useCelebration();

  if (!name) return null;

  return (
    <Suspense fallback={null}>
      <LottieOverlay name={name} onComplete={endCelebration} />
    </Suspense>
  );
};
