import { useCallback, useEffect, useRef, useState } from 'react';

// A pixel of slack: fractional layout widths leave scrollLeft short of the end
// by a hair, which would otherwise keep the hint up forever.
const EPSILON = 1;

export const useScrollHint = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);

  const measure = useCallback(() => {
    const node = ref.current;

    if (!node) return;

    setHasMore(node.scrollLeft + node.clientWidth < node.scrollWidth - EPSILON);
  }, []);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(node);
    for (const child of node.children) observer.observe(child);

    return () => observer.disconnect();
  }, [measure]);

  return { ref, hasMore, onScroll: measure };
};
