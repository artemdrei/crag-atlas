import type { SvgIconComponent } from '@mui/icons-material';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StraightenIcon from '@mui/icons-material/Straighten';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import type { RouteSort } from '../entities';

const ICONS: Record<RouteSort, SvgIconComponent> = {
  default: FormatListNumberedIcon,
  rating: StarBorderIcon,
  length: StraightenIcon,
  grade: TrendingUpIcon,
  ascents: GroupsOutlinedIcon
};

export interface Props {
  sort: RouteSort;
}

export const RouteSortIcon = ({ sort }: Props) => {
  const Icon = ICONS[sort];

  return <Icon fontSize="small" />;
};
