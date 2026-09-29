const MAX_EDGE = 2560;
const QUALITY = 0.82;

export interface SourceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WebpOptions {
  maxEdge?: number;
  crop?: SourceRect;
}

export interface CompressedPhoto {
  blob: Blob;
  width: number;
  height: number;
  ratio: number;
  sourceWidth: number;
  sourceHeight: number;
}

export const imageToWebp = async (
  file: File,
  { maxEdge = MAX_EDGE, crop }: WebpOptions = {}
): Promise<CompressedPhoto> => {
  const bitmap = await decode(file);
  const source = crop ?? fullFrame(bitmap);
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const blob = await encode(bitmap, source, width, height);
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;

  bitmap.close?.();

  // Always the WebP, even when it came out larger than an already-optimised
  // original: the API accepts nothing else.
  return {
    blob,
    width,
    height,
    ratio: width / height,
    sourceWidth,
    sourceHeight
  };
};

const fullFrame = ({ width, height }: ImageBitmap): SourceRect => ({
  x: 0,
  y: 0,
  width,
  height
});

const decode = async (file: File): Promise<ImageBitmap> => {
  // Without the orientation hint a canvas ignores EXIF, and every photo shot
  // in portrait on a phone comes out lying on its side.
  if ('createImageBitmap' in globalThis) {
    return createImageBitmap(file, { imageOrientation: 'from-image' });
  }

  const url = URL.createObjectURL(file);

  try {
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The photo could not be read'));
      image.src = url;
    });

    return image as unknown as ImageBitmap;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const encode = async (
  bitmap: CanvasImageSource,
  source: SourceRect,
  width: number,
  height: number
): Promise<Blob> => {
  if ('OffscreenCanvas' in globalThis) {
    const canvas = new OffscreenCanvas(width, height);

    draw(canvas.getContext('2d'), bitmap, source, width, height);

    return canvas.convertToBlob({ type: 'image/webp', quality: QUALITY });
  }

  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), bitmap, source, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('The photo could not be encoded')),
      'image/webp',
      QUALITY
    );
  });
};

const draw = (
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null,
  bitmap: CanvasImageSource,
  source: SourceRect,
  width: number,
  height: number
): void => {
  if (!context) throw new Error('This browser cannot encode the photo');

  context.imageSmoothingQuality = 'high';
  context.drawImage(
    bitmap,
    source.x,
    source.y,
    source.width,
    source.height,
    0,
    0,
    width,
    height
  );
};
