import { useEffect, useRef, useState } from 'react';

import { imageToWebp } from '@web/shared/lib';

export interface PhotoVersion {
  url: string;
  bytes: number;
  width: number;
  height: number;
}

export interface PhotoComparison {
  original: PhotoVersion;
  compressed: PhotoVersion;
  blob: Blob;
  ratio: number;
}

export interface CompressedPick {
  file: File;
  isFailed: boolean;
  comparison?: PhotoComparison;
}

export interface PhotoCompressionState {
  isCompressing: boolean;
  picks: CompressedPick[];
}

/**
 * Object URLs rather than data URLs: base64 is a third heavier and a topo is
 * a ten-megapixel photo. Both are revoked when the dialog goes away.
 *
 * One photo at a time, published as each lands: a dozen phone shots decoded at
 * once is a dozen full-size bitmaps in memory.
 */
export const usePhotoCompression = (files: File[]): PhotoCompressionState => {
  const [state, setState] = useState<PhotoCompressionState>({
    isCompressing: true,
    picks: []
  });
  const urls = useRef<string[]>([]);

  useEffect(() => {
    let isStale = false;

    const compress = async () => {
      const picks: CompressedPick[] = [];

      for (const file of files) {
        picks.push(await compressOne(file, urls.current));

        if (isStale) return;

        setState({ isCompressing: true, picks: [...picks] });
      }

      setState({ isCompressing: false, picks });
    };

    setState({ isCompressing: true, picks: [] });
    compress();

    return () => {
      isStale = true;
    };
  }, [files]);

  useEffect(
    () => () => {
      for (const url of urls.current) URL.revokeObjectURL(url);
    },
    []
  );

  return state;
};

const compressOne = async (
  file: File,
  urls: string[]
): Promise<CompressedPick> => {
  if (!file.type.startsWith('image/')) return { file, isFailed: true };

  try {
    const photo = await imageToWebp(file);
    const originalUrl = URL.createObjectURL(file);
    const compressedUrl = URL.createObjectURL(photo.blob);

    urls.push(originalUrl, compressedUrl);

    return {
      file,
      isFailed: false,
      comparison: {
        original: {
          url: originalUrl,
          bytes: file.size,
          width: photo.sourceWidth,
          height: photo.sourceHeight
        },
        compressed: {
          url: compressedUrl,
          bytes: photo.blob.size,
          width: photo.width,
          height: photo.height
        },
        blob: photo.blob,
        ratio: photo.ratio
      }
    };
  } catch {
    return { file, isFailed: true };
  }
};
