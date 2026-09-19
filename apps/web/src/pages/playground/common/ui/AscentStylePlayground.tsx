import Chip from '@mui/material/Chip';

import { ASCENT_STYLES, AscentStyleLabel } from '@web/shared/ui';

import { PlaygroundSection } from './PlaygroundSection';

export const AscentStylePlayground = () => (
  <PlaygroundSection title="Ascent styles">
    {ASCENT_STYLES.map((ascentStyle) => (
      <Chip
        key={ascentStyle}
        size="small"
        label={<AscentStyleLabel ascentStyle={ascentStyle} />}
      />
    ))}
  </PlaygroundSection>
);
