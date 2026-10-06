import type { SectorQr } from '@crag-atlas/api';

import { qrUrlOf } from '../../common';
import { drawQrPlaque, PLAQUE_MM, type PlaqueStyle } from './drawQrPlaque';

const A4_MM = { width: 210, height: 297 } as const;
const COLUMNS = 3;
const ROWS = 4;
const PER_PAGE = COLUMNS * ROWS;

export interface Params {
  rows: SectorQr[];
  origin: string;
  fileName: string;
  style: PlaqueStyle & { cutLine: string };
}

const fontsOf = async (style: PlaqueStyle, texts: string[]) => {
  const sample = texts.join('');

  await Promise.all([
    document.fonts.load(`700 64px ${style.titleFont}`, sample),
    document.fonts.load(`500 36px ${style.subtitleFont}`, sample)
  ]);
};

export const downloadQrPlaques = async ({
  rows,
  origin,
  fileName,
  style
}: Params): Promise<void> => {
  const printable = rows.filter(
    (row): row is SectorQr & { path: string } => !!row.path
  );

  if (!printable.length) return;

  await fontsOf(
    style,
    printable.flatMap((row) => [row.sectorName, row.sectorNameLocal ?? ''])
  );

  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const left = (A4_MM.width - COLUMNS * PLAQUE_MM.width) / 2;
  const top = (A4_MM.height - ROWS * PLAQUE_MM.height) / 2;

  pdf.setDrawColor(style.cutLine);
  pdf.setLineWidth(0.2);

  printable.forEach((row, index) => {
    const slot = index % PER_PAGE;

    if (index > 0 && slot === 0) pdf.addPage();

    const x = left + (slot % COLUMNS) * PLAQUE_MM.width;
    const y = top + Math.floor(slot / COLUMNS) * PLAQUE_MM.height;
    const plaque = drawQrPlaque(row, qrUrlOf(origin, row.path), style);

    pdf.addImage(
      plaque,
      'PNG',
      x,
      y,
      PLAQUE_MM.width,
      PLAQUE_MM.height,
      undefined,
      'FAST'
    );
    pdf.rect(x, y, PLAQUE_MM.width, PLAQUE_MM.height);
  });

  pdf.save(fileName);
};
