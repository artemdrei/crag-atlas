import { useLingui } from '@lingui/react/macro';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import ForestIcon from '@mui/icons-material/Forest';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

import type { Season } from '../lib';

export interface Props {
  season: Season;
}

export const SeasonIcon = ({ season }: Props) => {
  const { t } = useLingui();

  const icons: Record<Season, { Icon: typeof AcUnitIcon; label: string }> = {
    winter: { Icon: AcUnitIcon, label: t`Winter` },
    spring: { Icon: LocalFloristIcon, label: t`Spring` },
    summer: { Icon: BeachAccessIcon, label: t`Summer` },
    autumn: { Icon: ForestIcon, label: t`Autumn` }
  };

  const { Icon, label } = icons[season];

  return <Icon fontSize="small" color="disabled" titleAccess={label} />;
};
