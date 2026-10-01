import { MemoryRouter } from 'react-router';

import { I18nProvider } from '@lingui/react';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { i18n } from '@web/shared/i18n/i18n';
import { createAppTheme } from '@web/shared/theme/theme';

import { SignInCta } from './SignInCta';

i18n.load('en', {});
i18n.activate('en');

const renderCta = (onSignIn?: () => void) =>
  render(
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <ThemeProvider theme={createAppTheme('dark')}>
          <SignInCta to="/login" from="/regions/1" onSignIn={onSignIn} />
        </ThemeProvider>
      </I18nProvider>
    </MemoryRouter>
  );

describe('SignInCta', () => {
  it('is a followable link, not a button', () => {
    renderCta();

    expect(
      screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')
    ).toBe('/login');
  });

  it('reports the choice before leaving the page', () => {
    const onSignIn = vi.fn();
    renderCta(onSignIn);

    fireEvent.click(screen.getByRole('link', { name: 'Sign in' }));

    expect(onSignIn).toHaveBeenCalledOnce();
  });
});
