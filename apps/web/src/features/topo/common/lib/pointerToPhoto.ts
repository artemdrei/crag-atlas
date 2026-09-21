import type { Point } from './hitTest';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * The rect is read per event, never cached: zooming mid-drag moves it.
 */
export const pointerToPhoto = (
  event: { clientX: number; clientY: number },
  element: Element
): Point => {
  const rect = element.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) return [0, 0];

  return [
    clamp01((event.clientX - rect.left) / rect.width),
    clamp01((event.clientY - rect.top) / rect.height)
  ];
};

export const toleranceOf = (element: Element, pixels: number): number => {
  const { width } = element.getBoundingClientRect();

  return width === 0 ? 0 : pixels / width;
};
