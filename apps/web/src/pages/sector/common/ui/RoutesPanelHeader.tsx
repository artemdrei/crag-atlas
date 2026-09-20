import { Plural } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

export interface Props {
  routesCount: number;
}

export const RoutesPanelHeader = ({ routesCount }: Props) => (
  <Typography variant="subtitle1">
    <Plural value={routesCount} one="# route" other="# routes" />
  </Typography>
);
