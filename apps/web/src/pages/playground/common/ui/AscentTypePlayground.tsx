import Chip from '@mui/material/Chip';

import { ASCENT_TYPES } from '@web/shared/types';
import { AscentTypeLabel } from '@web/shared/ui';

import { PlaygroundSection } from './PlaygroundSection';

export const AscentTypePlayground = () => (
  <PlaygroundSection title="Ascent styles">
    {ASCENT_TYPES.map((ascentType) => (
      <Chip
        key={ascentType}
        size="small"
        label={<AscentTypeLabel ascentType={ascentType} />}
      />
    ))}
  </PlaygroundSection>
);
