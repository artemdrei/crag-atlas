import { I18nProvider } from '@lingui/react';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@web/shared/i18n/i18n';
import { createAppTheme } from '@web/shared/theme/theme';

import { LogTickButton } from './LogTickButton';

const openModal = vi.fn();
const user = { isAuthenticated: false };

vi.mock('@web/app/providers', () => ({
  useModal: () => ({ openModal }),
  useUser: () => user
}));

i18n.load('en', {});
i18n.activate('en');

const renderButton = () =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={createAppTheme('light')}>
        <LogTickButton idRoute="r1" routeName="Scarface" />
      </ThemeProvider>
    </I18nProvider>
  );

describe('LogTickButton', () => {
  beforeEach(() => {
    user.isAuthenticated = false;
    openModal.mockClear();
  });

  it('explains what signing in gives instead of leaving the route page', () => {
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Log ascent' }));

    expect(openModal).toHaveBeenCalledWith('SIGN_IN_PROMPT');
  });

  it('stays usable for a guest', () => {
    renderButton();

    expect(
      screen.getByRole('button', { name: 'Log ascent' })
    ).not.toHaveProperty('disabled', true);
  });

  it('opens the tick form for a member', () => {
    user.isAuthenticated = true;
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Log ascent' }));

    expect(openModal).toHaveBeenCalledWith(
      'LOG_TICK',
      expect.objectContaining({ idRoute: 'r1', routeName: 'Scarface' })
    );
  });
});
