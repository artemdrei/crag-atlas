import { useEffect, useState } from 'react';

import { I18nProvider } from '@lingui/react';

import { activateLocale, i18n, readStoredLocale } from '@web/shared/i18n/i18n';
import { ThemeModeProvider } from '@web/shared/theme/ThemeModeProvider';

import { AppToastProvider } from './AppToastProvider';
import { ModalProvider } from './modalProvider';
import { UserProvider } from './UserProvider';

// Aggregate feature modal registrations here as they're added, e.g.:
// [...routeModalRegistrations, ...sectorModalRegistrations]
const modalRegistrations = [];

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activateLocale(readStoredLocale()).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <I18nProvider i18n={i18n}>
      <ThemeModeProvider>
        <AppToastProvider>
          <UserProvider>
            <ModalProvider registrations={modalRegistrations}>
              {children}
            </ModalProvider>
          </UserProvider>
        </AppToastProvider>
      </ThemeModeProvider>
    </I18nProvider>
  );
};
