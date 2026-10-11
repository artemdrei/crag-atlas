import { useEffect, useRef } from 'react';

import { track } from '@crag-atlas/analytics';

export const useTrackVideoSearch = (
  term: string,
  total: number | undefined
) => {
  const reportedTerm = useRef('');

  useEffect(() => {
    if (!term || total === undefined || reportedTerm.current === term) return;

    reportedTerm.current = term;

    track({
      name: 'Search Performed',
      props: {
        scope: 'media',
        term_length: term.length,
        result_count: total,
        has_results: total > 0
      }
    });
  }, [term, total]);
};
