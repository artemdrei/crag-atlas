import { type TouchEvent, useRef } from 'react';

const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 0.5;
const FLING_MIN_DISTANCE = 40;
const FADE_DISTANCE = 400;
const SETTLE_TRANSITION = 'transform 200ms ease-out, opacity 200ms ease-out';

interface Options {
  isEnabled: boolean;
  onClose: () => void;
}

export const useSwipeDownToClose = ({ isEnabled, onClose }: Options) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ y: number; time: number } | null>(null);
  const offset = useRef(0);

  const paint = (y: number, isSettling: boolean) => {
    const stage = stageRef.current;
    const scrim = scrimRef.current;
    if (!stage || !scrim) return;

    stage.style.transition = isSettling ? SETTLE_TRANSITION : 'none';
    scrim.style.transition = isSettling ? SETTLE_TRANSITION : 'none';
    stage.style.transform = y ? `translateY(${y}px)` : '';
    scrim.style.opacity = String(Math.max(0, 1 - y / FADE_DISTANCE));
  };

  const cancel = () => {
    start.current = null;
    offset.current = 0;
    paint(0, true);
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];

    if (!isEnabled || !touch || event.touches.length > 1) {
      if (start.current) cancel();
      return;
    }
    start.current = { y: touch.clientY, time: event.timeStamp };
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!start.current) return;

    const touch = event.touches[0];

    if (!isEnabled || !touch || event.touches.length > 1) {
      cancel();
      return;
    }
    offset.current = Math.max(0, touch.clientY - start.current.y);
    paint(offset.current, false);
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (!start.current) return;

    const elapsed = Math.max(1, event.timeStamp - start.current.time);
    const isFlung = offset.current / elapsed > CLOSE_VELOCITY;

    if (
      offset.current > CLOSE_DISTANCE ||
      (isFlung && offset.current > FLING_MIN_DISTANCE)
    ) {
      start.current = null;
      onClose();
      return;
    }
    cancel();
  };

  return {
    stageRef,
    scrimRef,
    handlers: {
      onTouchStartCapture: onTouchStart,
      onTouchMoveCapture: onTouchMove,
      onTouchEndCapture: onTouchEnd,
      onTouchCancelCapture: cancel
    }
  };
};
