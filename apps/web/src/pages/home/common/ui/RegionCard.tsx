import CardActionArea from '@mui/material/CardActionArea';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useGradeRange } from '@web/shared/lib';
import { GradeBadge, PhotoPlaceholder } from '@web/shared/ui';

import type { Region } from '../entities';

export interface Props {
  region: Region;
  isSelected?: boolean;
  onSelect: (region: Region) => void;
}

export const RegionCard = ({ region, isSelected, onSelect }: Props) => {
  const gradeRange = useGradeRange(region);

  return (
    <CardAreaStyled isSelected={!!isSelected} onClick={() => onSelect(region)}>
      <ThumbnailStyled>
        {region.photoUrl ? (
          <PhotoStyled src={region.photoUrl} alt={region.name} />
        ) : (
          <PhotoPlaceholder />
        )}
      </ThumbnailStyled>
      <BodyStyled>
        <Typography variant="subtitle1">{region.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {region.province} · {region.rockType}
        </Typography>
        <FooterRowStyled>
          <GradeBadge grade={gradeRange} />
          <Typography variant="caption" color="text.secondary">
            {region.routeCount} routes · {region.sectorCount} sectors
          </Typography>
        </FooterRowStyled>
      </BodyStyled>
    </CardAreaStyled>
  );
};

// Shaped like a sector card: a small square thumbnail beside the text, so the
// card keeps its height whatever the grid's column count.
const CardAreaStyled = styled(CardActionArea, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.palette.primary.main : theme.palette.divider};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1.5)};
`;

const ThumbnailStyled = styled('div')`
  flex-shrink: 0;
  width: 96px;
`;

// Contained, not cropped: a crag photo loses its point when its edges are cut.
const PhotoStyled = styled('img')`
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex-grow: 1;
  min-width: 0;
`;

const FooterRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;
