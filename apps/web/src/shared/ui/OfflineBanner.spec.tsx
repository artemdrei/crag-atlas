import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@web/shared/i18n/i18n';

import { OfflineBanner } from './OfflineBanner';

i18n.load('en', {});
i18n.activate('en');

const setOnline = (isOnline: boolean) => {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(isOnline);
  dispatchEvent(new Event(isOnline ? 'online' : 'offline'));
};

describe('OfflineBanner', () => {
  afterEach(() => vi.restoreAllMocks());

  it('appears when the connection drops and goes when it is back', () => {
    render(
      <I18nProvider i18n={i18n}>
        <OfflineBanner />
      </I18nProvider>
    );

    expect(screen.queryByRole('status')).toBeNull();

    act(() => setOnline(false));
    expect(screen.getByRole('status').textContent).toBe(
      'You are offline — showing saved data'
    );

    act(() => setOnline(true));
    expect(screen.queryByRole('status')).toBeNull();
  });
});
