import type { Topo } from '@crag-atlas/api';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { photoFrame } from '@web/shared/theme/photoFrame';

import { usePhotoLabel } from '../hooks';

export interface Props {
  topos: Topo[];
  idActiveTopo?: string;
  onSelect: (idTopo: string) => void;
}

export const TopoThumbStrip = ({ topos, idActiveTopo, onSelect }: Props) => {
  const photoLabel = usePhotoLabel();

  return (
    <StripStyled>
      {topos.map((topo, index) => (
        <ThumbStyled
          key={topo.id}
          isActive={topo.id === idActiveTopo}
          onClick={() => onSelect(topo.id)}
        >
          <ThumbImageStyled
            src={topo.photoUrl}
            alt={photoLabel(index)}
            loading="lazy"
            decoding="async"
          />
          <ThumbLabelStyled variant="caption" noWrap>
            {photoLabel(index)}
          </ThumbLabelStyled>
        </ThumbStyled>
      ))}
    </StripStyled>
  );
};

const StripStyled = styled('div')`
  display: flex;
  /* A flex item shrinks by default, and a squeezed strip clips the square
     thumbs instead of the stage above it giving up the space. */
  flex: 0 0 auto;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ThumbStyled = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>`
  flex: 0 0 auto;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(0.5)};
  width: 96px;
  padding: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.palette.primary.main : 'transparent'};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.6)};
`;

const ThumbImageStyled = styled('img')`
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  background: ${({ theme }) => theme.palette.action.hover};
  ${({ theme }) => photoFrame(theme)}
`;

const ThumbLabelStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;
