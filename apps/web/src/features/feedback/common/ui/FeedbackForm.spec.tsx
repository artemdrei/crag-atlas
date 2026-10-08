import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createAppTheme } from '@web/shared/theme/theme';

import { FeedbackForm } from './FeedbackForm';

const toastError = vi.fn();

vi.mock('@web/shared/lib', async (importActual) => ({
  ...(await importActual<typeof import('@web/shared/lib')>()),
  toast: { error: (message: string) => toastError(message) }
}));

const theme = createAppTheme('light');

const renderForm = (isGuest = false) => {
  const onSubmit = vi.fn();

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <FeedbackForm
          isGuest={isGuest}
          isPending={false}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />
      </ThemeProvider>
    </I18nProvider>
  );

  return { onSubmit };
};

beforeAll(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('FeedbackForm', () => {
  it('needs nothing but a rating', () => {
    const { onSubmit } = renderForm();
    const send = screen.getByRole('button', { name: 'Send' });

    expect(send).toHaveProperty('disabled', true);

    fireEvent.click(screen.getByLabelText('4 of 5'));
    fireEvent.click(send);

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 4,
      message: '',
      email: ''
    });
  });

  it('asks a low rating what went wrong and a high one what went right', () => {
    renderForm();

    fireEvent.click(screen.getByLabelText('2 of 5'));
    expect(screen.getByLabelText('What could be better?')).toBeDefined();

    fireEvent.click(screen.getByLabelText('5 of 5'));
    expect(screen.getByLabelText('What do you like?')).toBeDefined();
  });

  it('offers a guest an email field only once they have written something', () => {
    renderForm(true);

    expect(screen.queryByLabelText(/Email/)).toBeNull();

    fireEvent.change(screen.getByLabelText('What do you like?'), {
      target: { value: 'The topos are great' }
    });

    expect(screen.getByLabelText(/Email/)).toBeDefined();
  });

  it('drops a submission that filled the honeypot and lets a person retry', () => {
    const { onSubmit } = renderForm();
    const send = screen.getByRole('button', { name: 'Send' });

    fireEvent.click(screen.getByLabelText('3 of 5'));
    fireEvent.change(screen.getByLabelText('Website'), {
      target: { value: 'http://spam.example' }
    });
    fireEvent.click(send);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledOnce();

    fireEvent.click(send);

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
