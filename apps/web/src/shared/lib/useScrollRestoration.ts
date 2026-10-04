import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

const RESTORE_TIMEOUT_MS = 1000;

const positions = new Map<string, number>();

const restoreScroll = (element: HTMLElement, top: number) => {
  const deadline = performance.now() + RESTORE_TIMEOUT_MS;
  let frame = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    element.removeEventListener('touchstart', stop);
    element.removeEventListener('wheel', stop);
  };

  const attempt = () => {
    element.scrollTop = top;
    if (element.scrollTop >= top - 1 || performance.now() > deadline) {
      stop();
      return;
    }
    frame = requestAnimationFrame(attempt);
  };

  element.addEventListener('touchstart', stop, { passive: true });
  element.addEventListener('wheel', stop, { passive: true });
  attempt();

  return stop;
};

export const useScrollRestoration = (ref: RefObject<HTMLElement | null>) => {
  const { key, pathname } = useLocation();
  const navigationType = useNavigationType();
  const keyRef = useRef(key);
  const pathnameRef = useRef(pathname);

  // Saved on every scroll, not when leaving: by the time a cleanup runs the
  // next page is already in the container and its scrollTop is clamped.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const save = () => positions.set(keyRef.current, element.scrollTop);

    element.addEventListener('scroll', save, { passive: true });
    return () => element.removeEventListener('scroll', save);
  }, [ref]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the history entry fires this; pathname and navigationType change with it
  useLayoutEffect(() => {
    keyRef.current = key;
    const isNewPath = pathnameRef.current !== pathname;
    pathnameRef.current = pathname;

    const element = ref.current;
    if (!element) return;

    if (navigationType === 'POP') {
      return restoreScroll(element, positions.get(key) ?? 0);
    }

    if (isNewPath) element.scrollTo({ top: 0 });
  }, [key, ref]);
};
