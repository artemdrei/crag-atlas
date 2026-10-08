import { useEffect, useRef } from 'react';

import { styled } from '@mui/material/styles';
import lottie, {
  type AnimationItem
} from 'lottie-web/build/player/lottie_light';

import type { CelebrationName } from '@web/shared/lib';

import { ANIMATIONS } from './animations';

export interface Props {
  name: CelebrationName;
  onComplete: () => void;
}

const LottieOverlay = ({ name, onComplete }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    let isCancelled = false;
    let animation: AnimationItem | undefined;

    const { load, segment } = ANIMATIONS[name];

    load().then((animationData) => {
      if (isCancelled) return;

      animation = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData,
        initialSegment: segment,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
      });

      animation.addEventListener('complete', onComplete);
    }, onComplete);

    return () => {
      isCancelled = true;
      animation?.destroy();
    };
  }, [name, onComplete]);

  return <OverlayStyled ref={containerRef} aria-hidden />;
};

export default LottieOverlay;

const OverlayStyled = styled('div')`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.tooltip + 1};
  pointer-events: none;

  & svg {
    width: 100%;
    height: 100%;
  }
`;
