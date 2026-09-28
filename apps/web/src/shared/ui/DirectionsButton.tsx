import { Trans } from '@lingui/react/macro';
import DirectionsIcon from '@mui/icons-material/Directions';
import Button from '@mui/material/Button';

import { buildDirectionsUrl } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';

export interface Props {
  point?: Coords;
}

export const DirectionsButton = ({ point }: Props) => {
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
