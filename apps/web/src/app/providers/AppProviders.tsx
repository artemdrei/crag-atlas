import { useEffect, useState } from 'react';

import { I18nProvider } from '@lingui/react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import {
  QUERY_CACHE_MAX_AGE,
  queryClient,
  queryPersister
} from '@web/shared/api';
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: QUERY_CACHE_MAX_AGE,
        // A release may change what an endpoint returns.
        buster: __APP_VERSION__
      }}
      // Restored queries keep their old fetch time and would count as fresh,
      // so a reload would show yesterday's data without asking the API.
      onSuccess={() => queryClient.invalidateQueries()}
    >
      <I18nProvider i18n={i18n}>
        <EditModeProvider>
          <ThemedApp>
            <AppToastProvider>
              <UserProvider>{children}</UserProvider>
            </AppToastProvider>
          </ThemedApp>
        </EditModeProvider>
      </I18nProvider>
    </PersistQueryClientProvider>
  );
};
