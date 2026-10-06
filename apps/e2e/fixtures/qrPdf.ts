import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import type { BrowserContext } from '@playwright/test';

const require = createRequire(import.meta.url);

const fileOf = (specifier: string) => readFileSync(require.resolve(specifier));

const READER_ORIGIN = 'http://qr-reader.test';

// Kept in step with drawQrPlaque.ts and downloadQrPlaques.ts: 60 mm square
// plaques, three across and four down, centred on an A4 page.
const LAYOUT = {
  plaqueMm: 60,
  columns: 3,
  rows: 4,
  leftMm: 15,
  topMm: 28.5
} as const;

const READER_PAGE = `<!doctype html>
<script src="/jsQR.js"></script>
<script type="module">
  import * as pdfjs from '/pdf.mjs';

  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

  const SCALE = 4;
  const px = (mm) => (mm / 25.4) * 72 * SCALE;

  window.readPlaques = async (layout) => {
    const pdf = await pdfjs.getDocument({ url: '/plaques.pdf' }).promise;
    const pages = [];

    for (let number = 1; number <= pdf.numPages; number += 1) {
      const page = await pdf.getPage(number);
      const viewport = page.getViewport({ scale: SCALE });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      await page.render({ canvas, canvasContext: context, viewport }).promise;

      const slots = [];

      for (let row = 0; row < layout.rows; row += 1) {
        for (let column = 0; column < layout.columns; column += 1) {
          const side = px(layout.plaqueMm);
          const image = context.getImageData(
            px(layout.leftMm + column * layout.plaqueMm),
            px(layout.topMm + row * layout.plaqueMm),
            side,
            side
          );

          slots.push(window.jsQR(image.data, image.width, image.height)?.data ?? null);
        }
      }

      pages.push(slots);
    }

    return pages;
  };

  window.isReaderReady = true;
</script>`;

/**
 * Renders a downloaded plaque PDF the way a printer would and reads every
 * plaque with a QR decoder: what comes back is what a phone camera would open,
 * page by page and slot by slot, null where a slot holds no readable code.
 */
export const readQrPlaques = async (
  context: BrowserContext,
  pdf: Buffer
): Promise<(string | null)[][]> => {
  const reader = await context.newPage();
  const files: Record<string, { body: Buffer | string; contentType: string }> =
    {
      '/': { body: READER_PAGE, contentType: 'text/html' },
      '/plaques.pdf': { body: pdf, contentType: 'application/pdf' },
      '/jsQR.js': {
        body: fileOf('jsqr/dist/jsQR.js'),
        contentType: 'text/javascript'
      },
      '/pdf.mjs': {
        body: fileOf('pdfjs-dist/build/pdf.mjs'),
        contentType: 'text/javascript'
      },
      '/pdf.worker.mjs': {
        body: fileOf('pdfjs-dist/build/pdf.worker.mjs'),
        contentType: 'text/javascript'
      }
    };

  await reader.route(`${READER_ORIGIN}/**`, (route) => {
    const file = files[new URL(route.request().url()).pathname];

    return file
      ? route.fulfill({ body: file.body, contentType: file.contentType })
      : route.fulfill({ status: 404 });
  });

  try {
    await reader.goto(`${READER_ORIGIN}/`);
    await reader.waitForFunction(() => 'isReaderReady' in window);

    return await reader.evaluate(
      (layout) =>
        (
          window as unknown as {
            readPlaques: (layout: unknown) => Promise<(string | null)[][]>;
          }
        ).readPlaques(layout),
      LAYOUT
    );
  } finally {
    await reader.close();
  }
};
