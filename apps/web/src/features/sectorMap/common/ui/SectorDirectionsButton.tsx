import { Trans } from '@lingui/react/macro';
import DirectionsIcon from '@mui/icons-material/Directions';
import Button from '@mui/material/Button';

import type { Coords } from '../entities';
import { buildDirectionsUrl } from '../lib';

export interface Props {
  point?: Coords;
}

export const SectorDirectionsButton = ({ point }: Props) => {
  if (!point) return null;

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<DirectionsIcon fontSize="small" />}
      href={buildDirectionsUrl(point)}
      target="_blank"
      rel="noreferrer"
    >
      <Trans>Directions</Trans>
    </Button>
  );
};
