import CardActionArea from '@mui/material/CardActionArea';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useGradeRange } from '@web/shared/lib';
import { GradeBadge, PhotoPlaceholder, UnsavedBadge } from '@web/shared/ui';

import type { Sector } from '../entities';

export interface Props {
  sector: Sector;
  isSelected?: boolean;
  isUnsaved?: boolean;
  onSelect: (sector: Sector) => void;
}

export const SectorCard = ({
  sector,
  isSelected,
  isUnsaved,
  onSelect
}: Props) => {
  const gradeRange = useGradeRange(sector);

  return (
    <CardAreaStyled isSelected={!!isSelected} onClick={() => onSelect(sector)}>
      {isUnsaved && <UnsavedBadge />}
      <ThumbnailStyled>
        {sector.photoUrl ? (
          <PhotoStyled src={sector.photoUrl} alt={sector.name} />
        ) : (
          <PhotoPlaceholder />
        )}
      </ThumbnailStyled>
      <BodyStyled>
        <HeaderRowStyled>
          <Typography variant="subtitle1" noWrap>
            {sector.name}
          </Typography>
          <GradeBadge grade={gradeRange} />
        </HeaderRowStyled>
        <Typography variant="body2" color="text.secondary">
          {sector.description}
        </Typography>
        <FooterRowStyled>
          <Typography variant="caption" color="text.secondary">
            {sector.routeCount} routes
          </Typography>
        </FooterRowStyled>
      </BodyStyled>
    </CardAreaStyled>
  );
};

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
  position: relative;
  padding: ${({ theme }) => theme.spacing(1.5)};
`;

const ThumbnailStyled = styled('div')`
  flex-shrink: 0;
  width: 96px;
`;

// Contained, not cropped: a wall photo loses its point when its edges are cut.
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

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const FooterRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;
