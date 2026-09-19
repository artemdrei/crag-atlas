import { useEffect, useState } from 'react';

import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@web/shared/api';
import { activateLocale, i18n, readStoredLocale } from '@web/shared/i18n/i18n';
import { ThemeModeProvider } from '@web/shared/theme/ThemeModeProvider';

import { AppToastProvider } from './AppToastProvider';
import type { ModalRegistration } from './modalProvider';
import { ModalProvider } from './modalProvider';
import { UserProvider } from './UserProvider';

export interface Props {
  // Device-specific: App.tsx picks the desktop or mobile set, so no component
  // below has to re-check the device.
  modalRegistrations: ModalRegistration[];
  children: React.ReactNode;
}

export const AppProviders = ({ modalRegistrations, children }: Props) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activateLocale(readStoredLocale()).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};
