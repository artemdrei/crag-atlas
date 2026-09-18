import { I18nProvider } from '@lingui/react';

import { useEffect, useState } from 'react';

import { activateLocale, i18n, readStoredLocale } from '@web/i18n/i18n';
import { ThemeModeProvider } from '@web/shared/theme/ThemeModeProvider';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activateLocale(readStoredLocale()).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <I18nProvider i18n={i18n}>
      <ThemeModeProvider>{children}</ThemeModeProvider>
    </I18nProvider>
  );
};
