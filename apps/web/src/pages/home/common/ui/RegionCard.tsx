import CardActionArea from '@mui/material/CardActionArea';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { Region } from '../entities';

export interface Props {
  region: Region;
  onSelect: (region: Region) => void;
}

export const RegionCard = ({ region, onSelect }: Props) => (
  <CardAreaStyled onClick={() => onSelect(region)}>
    <ThumbnailStyled />
    <BodyStyled>
      <Typography variant="subtitle1" fontWeight={700}>
        {region.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {region.province} · {region.rockType}
      </Typography>
      <FooterRowStyled>
        <GradeBadge grade={region.gradeRange} />
        <Typography variant="caption" color="text.secondary">
          {region.routeCount} routes · {region.sectorCount} sectors
        </Typography>
      </FooterRowStyled>
    </BodyStyled>
  </CardAreaStyled>
);

const CardAreaStyled = styled(CardActionArea)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  overflow: hidden;
`;

const ThumbnailStyled = styled('div')`
  height: 120px;
  background: ${({ theme }) => theme.palette.action.hover};
`;

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(1.5)};
`;

const FooterRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;
