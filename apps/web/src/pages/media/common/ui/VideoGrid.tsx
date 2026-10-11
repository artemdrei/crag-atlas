import { type ReactNode, useEffect, useRef, useState } from 'react';

import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

export interface Props {
  minColumnWidth: number;
  itemCount: number;
  hasMore: boolean;
  children: ReactNode;
}

export const VideoGrid = ({
  minColumnWidth,
  itemCount,
  hasMore,
  children
}: Props) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) return;

    const observer = new ResizeObserver(() => {
      const tracks = getComputedStyle(grid).gridTemplateColumns.split(' ');

      setColumns(Math.max(tracks.length, 1));
    });

    observer.observe(grid);

    return () => observer.disconnect();
  }, []);

  // The next page lands in this row first, so the placeholders finish it
  // before starting one of their own.
  const skeletonCount = hasMore
    ? ((columns - (itemCount % columns)) % columns) + columns
    : 0;

  return (
    <GridStyled ref={gridRef} minColumnWidth={minColumnWidth}>
      {children}
      <VideoCardSkeletons count={skeletonCount} />
    </GridStyled>
  );
};

export interface VideoGridSkeletonProps {
  count: number;
  minColumnWidth: number;
}

export const VideoGridSkeleton = ({
  count,
  minColumnWidth
}: VideoGridSkeletonProps) => (
  <GridStyled minColumnWidth={minColumnWidth}>
    <VideoCardSkeletons count={count} />
  </GridStyled>
);

const VideoCardSkeletons = ({ count }: { count: number }) =>
  Array.from({ length: count }, (_, index) => `skeleton-${index}`).map(
    (key) => (
      <div key={key}>
        <ThumbSkeletonStyled variant="rounded" />
        <Skeleton width="70%" />
        <Skeleton width="45%" />
      </div>
    )
  );

const GridStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'minColumnWidth'
})<{ minColumnWidth: number }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(${({ minColumnWidth }) => minColumnWidth}px, 1fr)
  );
  gap: ${({ theme }) => theme.spacing(3, 2)};
`;

const ThumbSkeletonStyled = styled(Skeleton)`
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
`;
