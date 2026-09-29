import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

export const RouteSkeleton = () => (
  <ColumnStyled>
    <PhotoStyled variant="rounded" />
    <Skeleton variant="text" width="40%" height={40} />
    <Skeleton variant="text" width="25%" />
    <Skeleton variant="text" width="70%" />
    <Skeleton variant="text" width="55%" />
  </ColumnStyled>
);

const ColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const PhotoStyled = styled(Skeleton)`
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;
