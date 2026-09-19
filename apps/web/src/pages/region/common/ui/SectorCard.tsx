import CardActionArea from '@mui/material/CardActionArea';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { Sector } from '../entities';

export interface Props {
  sector: Sector;
  onSelect: (sector: Sector) => void;
}

export const SectorCard = ({ sector, onSelect }: Props) => (
  <CardAreaStyled onClick={() => onSelect(sector)}>
    <ThumbnailStyled />
    <BodyStyled>
      <HeaderRowStyled>
        <Typography variant="subtitle1" fontWeight={700}>
          {sector.name}
        </Typography>
        <GradeBadge grade={sector.gradeRange} />
      </HeaderRowStyled>
      <Typography variant="body2" color="text.secondary">
        {sector.description}
      </Typography>
      <FooterRowStyled>
        <Typography variant="caption" color="text.secondary">
          {sector.routeCount} routes
        </Typography>
        {!!sector.approachMinutes && (
          <Typography variant="caption" color="text.secondary">
            {sector.approachMinutes} min approach
          </Typography>
        )}
      </FooterRowStyled>
    </BodyStyled>
  </CardAreaStyled>
);

const CardAreaStyled = styled(CardActionArea)`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1.5)};
`;

const ThumbnailStyled = styled('div')`
  flex-shrink: 0;
  width: 96px;
  height: 96px;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};
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
