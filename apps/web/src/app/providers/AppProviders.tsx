import { useEffect, useState } from 'react';

import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@web/shared/api';
import { activateLocale, i18n, readStoredLocale } from '@web/shared/i18n/i18n';
import { ThemeModeProvider } from '@web/shared/theme/ThemeModeProvider';

import { AppToastProvider } from './AppToastProvider';
import { EditModeProvider, useEditMode } from './EditModeProvider';
import { UserProvider } from './UserProvider';

export interface Props {
  children: React.ReactNode;
}

const ThemedApp = ({ children }: { children: React.ReactNode }) => {
  const { isEditing } = useEditMode();

  return (
    <ThemeModeProvider isEditing={isEditing}>{children}</ThemeModeProvider>
  );
};

export const AppProviders = ({ children }: Props) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    activateLocale(readStoredLocale()).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider i18n={i18n}>
        <EditModeProvider>
          <ThemedApp>
            <AppToastProvider>
              <UserProvider>{children}</UserProvider>
            </AppToastProvider>
          </ThemedApp>
        </EditModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};
