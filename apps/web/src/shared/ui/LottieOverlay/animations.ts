import type { CelebrationName } from '@web/shared/lib';

interface Animation {
  load: () => Promise<object>;
  segment?: [number, number];
}

export const ANIMATIONS: Record<CelebrationName, Animation> = {
  confetti: {
    load: () =>
      import('@web/assets/lottie/confetti.json').then(
        (module) => module.default
      ),
    // The file plays its burst twice: the second run from frame 230 was the
    // marker-driven "fade" in its source project.
    segment: [0, 230]
  }
};
