import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

import { TILE_RATIO, TILE_WIDTH } from './tile';

export interface Props {
  count?: number;
}

export const RouteMediaSkeleton = ({ count = 2 }: Props) => {
  const keys = Array.from({ length: count }, (_, index) => `tile-${index}`);

  return (
    <StripStyled>
      {keys.map((key) => (
        <TileStyled key={key} variant="rounded" />
      ))}
    </StripStyled>
  );
};

const StripStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const TileStyled = styled(Skeleton)`
  flex: 0 0 auto;
  width: ${TILE_WIDTH}px;
  height: auto;
  aspect-ratio: ${TILE_RATIO};
`;
