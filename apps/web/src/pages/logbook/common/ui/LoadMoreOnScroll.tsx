import { useEffect, useRef } from 'react';

import { TicksSkeleton } from './TicksSkeleton';

export interface Props {
  hasMore: boolean;
  isLoading: boolean;
  onReach: () => void;
}

export const LoadMoreOnScroll = ({ hasMore, isLoading, onReach }: Props) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    // Re-observing after each page loads re-fires if the skeleton is still in view.
    if (!sentinel || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onReach();
      }
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onReach]);

  if (!hasMore) {
    return null;
  }

  return (
    <div ref={sentinelRef}>
      <TicksSkeleton count={1} />
    </div>
  );
};
