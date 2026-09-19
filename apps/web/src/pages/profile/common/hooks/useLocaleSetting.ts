import { useState } from 'react';

import {
  activateLocale,
  type Locale,
  readStoredLocale
} from '@web/shared/i18n/i18n';

export const useLocaleSetting = () => {
  const [locale, setLocale] = useState<Locale>(readStoredLocale);

  // activateLocale dynamically imports the catalog — awaiting it keeps two
  // quick switches from landing out of order.
  const changeLocale = async (next: Locale) => {
    await activateLocale(next);
    setLocale(next);
  };

  return { locale, changeLocale };
};
