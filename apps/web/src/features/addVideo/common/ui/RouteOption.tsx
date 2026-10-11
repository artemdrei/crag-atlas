import type { VideoRoute } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeText } from '@web/shared/ui';

export interface Props {
  route: VideoRoute;
}

export const RouteOption = ({ route }: Props) => (
  <OptionStyled>
    <Typography variant="body1" component="span">
      {route.name} <GradeText grade={route.grade} scale={route.gradeScale} />
    </Typography>
    <Typography variant="caption" color="text.secondary" noWrap>
      {[route.regionName, route.sectorName].filter(Boolean).join(' · ')}
    </Typography>
  </OptionStyled>
);

const OptionStyled = styled('span')`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;
