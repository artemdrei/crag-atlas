import { useEffect, useState } from 'react';

import { loadTransliteration } from './toLatin';

export const useTransliteration = (): boolean => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isLive = true;

    void loadTransliteration().then(() => {
      if (isLive) setIsReady(true);
    });

    return () => {
      isLive = false;
    };
  }, []);

  return isReady;
};
