import { flushAnalytics, track } from '@crag-atlas/analytics';
import { Trans } from '@lingui/react/macro';
import DirectionsIcon from '@mui/icons-material/Directions';
import Button from '@mui/material/Button';

import { buildDirectionsUrl } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';

export interface Props {
  entityType: 'region' | 'sector';
  point?: Coords;
}

export const DirectionsButton = ({ entityType, point }: Props) => {
  if (!point) return null;

  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<DirectionsIcon fontSize="small" />}
      href={buildDirectionsUrl(point)}
      onClick={() => {
        track({
          name: 'Directions Requested',
          props: { entity_type: entityType }
        });
        // The maps app takes over without a pagehide.
        flushAnalytics();
      }}
      target="_blank"
      rel="noreferrer"
    >
      <Trans>Directions</Trans>
    </Button>
  );
};
