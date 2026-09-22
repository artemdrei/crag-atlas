import type { Point } from './hitTest';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Both take the rect rather than the element: a handler needs the point and
 * the tolerance together, and reading it twice costs two layout flushes per
 * pointer event. The caller reads it per event, never caches it — zooming
 * mid-drag moves it.
 */
export const pointerToPhoto = (
  event: { clientX: number; clientY: number },
  rect: DOMRect
): Point => {
  if (rect.width === 0 || rect.height === 0) return [0, 0];

  return [
    clamp01((event.clientX - rect.left) / rect.width),
    clamp01((event.clientY - rect.top) / rect.height)
  ];
};

export const toleranceOf = (rect: DOMRect, pixels: number): number =>
  rect.width === 0 ? 0 : pixels / rect.width;
