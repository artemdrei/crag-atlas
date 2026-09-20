import type { Topo } from '@crag-atlas/api';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  topos: Topo[];
  idActiveTopo?: string;
  onSelect: (idTopo: string) => void;
}

export const TopoThumbStrip = ({ topos, idActiveTopo, onSelect }: Props) => (
  <StripStyled>
    {topos.map((topo) => (
      <ThumbStyled
        key={topo.id}
        isActive={topo.id === idActiveTopo}
        onClick={() => onSelect(topo.id)}
      >
        <ThumbImageStyled
          src={topo.photoUrl}
          alt={topo.label}
          loading="lazy"
          decoding="async"
        />
        <ThumbLabelStyled variant="caption" noWrap>
          {topo.label}
        </ThumbLabelStyled>
      </ThumbStyled>
    ))}
  </StripStyled>
);

const StripStyled = styled('div')`
  display: flex;
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
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};
`;

const ThumbLabelStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;
