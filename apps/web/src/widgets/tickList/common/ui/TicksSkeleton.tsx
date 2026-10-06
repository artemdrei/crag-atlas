import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

export interface Props {
  count?: number;
}

export const TicksSkeleton = ({ count = 4 }: Props) => {
  const keys = Array.from({ length: count }, (_, index) => `tick-${index}`);

  return (
    <ListStyled data-testid="ticks-skeleton">
      {keys.map((key) => (
        <TickStyled key={key}>
          <HeadStyled>
            <Skeleton variant="text" width="45%" height={28} />
            <Skeleton variant="rounded" width={44} height={24} />
          </HeadStyled>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="30%" />
        </TickStyled>
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const TickStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const HeadStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;
