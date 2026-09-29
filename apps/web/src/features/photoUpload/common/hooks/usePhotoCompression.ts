import { useCallback, useEffect, useRef, useState } from 'react';

import type { SourceRect } from '@web/shared/lib';
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

export interface PhotoCompression extends PhotoCompressionState {
  // Re-read from the file, never from the last result, so crops do not stack.
  applyCrop: (index: number, crop: SourceRect) => Promise<void>;
}

export const usePhotoCompression = (files: File[]): PhotoCompression => {
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

  const picksRef = useRef(state.picks);
  picksRef.current = state.picks;

  const applyCrop = useCallback(
    async (index: number, crop: SourceRect) => {
      const file = files[index];
      const previous = picksRef.current[index]?.comparison;

      if (!file) return;

      setState((current) => ({ ...current, isCompressing: true }));

      const cropped = await compressOne(
        file,
        urls.current,
        crop,
        previous?.original.url
      );

      const stale = previous?.compressed.url;

      if (stale) {
        URL.revokeObjectURL(stale);
        urls.current = urls.current.filter((url) => url !== stale);
      }

      setState((current) => ({
        isCompressing: false,
        picks: current.picks.map((pick, at) => (at === index ? cropped : pick))
      }));
    },
    [files]
  );

  return { ...state, applyCrop };
};

const compressOne = async (
  file: File,
  urls: string[],
  crop?: SourceRect,
  keptOriginalUrl?: string
): Promise<CompressedPick> => {
  if (!file.type.startsWith('image/')) return { file, isFailed: true };

  try {
    const photo = await imageToWebp(file, { crop });
    const originalUrl = keptOriginalUrl ?? URL.createObjectURL(file);
    const compressedUrl = URL.createObjectURL(photo.blob);

    if (!keptOriginalUrl) urls.push(originalUrl);
    urls.push(compressedUrl);

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
