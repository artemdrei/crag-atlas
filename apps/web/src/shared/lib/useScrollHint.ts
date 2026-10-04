import { useCallback, useEffect, useRef, useState } from 'react';

// Fractional layout widths leave scrollLeft a hair short of the end.
const EPSILON = 1;

export const useScrollHint = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);
  const [hasBefore, setHasBefore] = useState(false);

  const measure = useCallback(() => {
    const node = ref.current;

    if (!node) return;

    setHasMore(node.scrollLeft + node.clientWidth < node.scrollWidth - EPSILON);
    setHasBefore(node.scrollLeft > EPSILON);
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

  return { ref, hasMore, hasBefore, onScroll: measure };
};
