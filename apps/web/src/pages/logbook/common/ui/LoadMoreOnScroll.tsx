import { useEffect, useRef } from 'react';

import { Trans } from '@lingui/react/macro';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  hasMore: boolean;
  isLoading: boolean;
  onReach: () => void;
}

export const LoadMoreOnScroll = ({ hasMore, isLoading, onReach }: Props) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onReach();
      }
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, onReach]);

  if (!hasMore) {
    return null;
  }

  return (
    <SentinelStyled ref={sentinelRef}>
      {isLoading ? (
        <CircularProgress size={20} />
      ) : (
        <Typography variant="body2" color="text.secondary">
          <Trans>Loading more…</Trans>
        </Typography>
      )}
    </SentinelStyled>
  );
};

const SentinelStyled = styled('div')`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;
