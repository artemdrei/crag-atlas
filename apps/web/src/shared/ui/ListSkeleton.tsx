import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

type Variant = 'card' | 'row';

export interface Props {
  count?: number;
  variant?: Variant;
}

export const ListSkeleton = ({ count = 4, variant = 'card' }: Props) => {
  const keys = Array.from({ length: count }, (_, index) => `skeleton-${index}`);

  return (
    <ListStyled variant={variant} data-testid="list-skeleton">
      {keys.map((key) =>
        variant === 'card' ? (
          <CardStyled key={key}>
            <Skeleton variant="rounded" width={96} height={96} />
            <TextStyled>
              <Skeleton variant="text" width="55%" height={24} />
              <Skeleton variant="text" width="35%" />
              <Skeleton variant="rounded" height={32} />
            </TextStyled>
          </CardStyled>
        ) : (
          <RowStyled key={key}>
            <Skeleton variant="rounded" width={28} height={28} />
            <TextStyled>
              <Skeleton variant="text" width="45%" height={20} />
              <Skeleton variant="text" width="65%" />
            </TextStyled>
            <Skeleton variant="rounded" width={44} height={24} />
          </RowStyled>
        )
      )}
    </ListStyled>
  );
};

const GAP: Record<Variant, number> = { card: 2, row: 1.5 };

const ListStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'variant'
})<{ variant: Variant }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme, variant }) => theme.spacing(GAP[variant])};
`;

const CardStyled = styled('div')`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const TextStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex-grow: 1;
  min-width: 0;
`;
