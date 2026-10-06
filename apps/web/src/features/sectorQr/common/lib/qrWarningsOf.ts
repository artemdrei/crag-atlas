import type { SectorQr } from '@crag-atlas/api';

export type QrWarning =
  | 'noCountry'
  | 'noPath'
  | 'noLocalName'
  | 'numberedSlug'
  | 'longName'
  | 'archived';

// Past this the name on a 60 mm plaque shrinks below a size read from a step
// back.
const PLAQUE_NAME_MAX_LENGTH = 24;

const NUMBERED_SLUG = /-\d+$/;

export const qrWarningsOf = (row: SectorQr): QrWarning[] => {
  const warnings: QrWarning[] = [];

  if (!row.country) warnings.push('noCountry');
  else if (!row.path) warnings.push('noPath');

  if (!row.sectorNameLocal) warnings.push('noLocalName');
  if (row.path && NUMBERED_SLUG.test(row.path)) warnings.push('numberedSlug');

  const printedName = row.sectorNameLocal || row.sectorName;

  if (printedName.length > PLAQUE_NAME_MAX_LENGTH) warnings.push('longName');
  if (row.isArchived) warnings.push('archived');

  return warnings;
};
