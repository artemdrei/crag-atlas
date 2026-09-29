import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

const CONTROL_WIDTH = 220;

export const ProfileSkeleton = () => (
  <PageStyled>
    <Skeleton variant="text" width={180} height={48} />
    <IdentityStyled>
      <Skeleton variant="circular" width={80} height={80} />
      <Skeleton variant="text" width={160} height={32} />
      <Skeleton variant="text" width={200} />
    </IdentityStyled>
    <RowStyled>
      <Skeleton variant="text" width={120} />
      <Skeleton variant="rounded" width={140} height={32} />
    </RowStyled>
    <RowStyled>
      <Skeleton variant="text" width={80} />
      <Skeleton variant="rounded" width={140} height={32} />
    </RowStyled>
    <RowStyled>
      <Skeleton variant="text" width={240} />
      <Skeleton variant="rounded" width={CONTROL_WIDTH} height={40} />
    </RowStyled>
    <RowStyled>
      <Skeleton variant="text" width={250} />
      <Skeleton variant="rounded" width={CONTROL_WIDTH} height={40} />
    </RowStyled>
    <Skeleton variant="rounded" height={44} />
  </PageStyled>
);

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const IdentityStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
