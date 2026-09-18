import { I18nProvider } from '@lingui/react';

import { useEffect, useState } from 'react';

import { activateLocale, i18n, readStoredLocale } from '@web/shared/i18n/i18n';
import { ThemeModeProvider } from '@web/shared/theme/ThemeModeProvider';

import { UserProvider } from './UserProvider';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activateLocale(readStoredLocale()).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <I18nProvider i18n={i18n}>
      <ThemeModeProvider>
        <UserProvider>{children}</UserProvider>
      </ThemeModeProvider>
    </I18nProvider>
  );
};
