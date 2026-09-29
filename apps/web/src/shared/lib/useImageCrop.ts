import { useState } from 'react';

import type { SourceRect } from './imageToWebp';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.05;

export interface CropPoint {
  x: number;
  y: number;
}

const CENTRED: CropPoint = { x: 0, y: 0 };

export const useImageCrop = () => {
  const [aspect, setAspect] = useState<number>();
  const [position, setPosition] = useState<CropPoint>(CENTRED);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [crop, setCrop] = useState<SourceRect | null>(null);

  return {
    aspect,
    position,
    zoom,
    crop,
    // A new shape is a new frame: keeping the old offset would leave it
    // hanging off the photo the moment the proportions change.
    changeAspect: (next?: number) => {
      setAspect(next);
      setPosition(CENTRED);
    },
    setPosition,
    setZoom,
    setCrop
  };
};
