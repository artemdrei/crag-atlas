import { type ReactNode, useEffect, useRef } from 'react';

export interface Props {
  hasMore: boolean;
  isLoading: boolean;
  onReach: () => void;
  rootMargin?: string;
  children?: ReactNode;
}

export const LoadMoreOnScroll = ({
  hasMore,
  isLoading,
  onReach,
  rootMargin,
  children
}: Props) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    // Re-observing after each page loads re-fires if the skeleton is still in view.
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onReach();
      },
      { rootMargin }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onReach, rootMargin]);

  if (!hasMore) return null;

  return <div ref={sentinelRef}>{children}</div>;
};
