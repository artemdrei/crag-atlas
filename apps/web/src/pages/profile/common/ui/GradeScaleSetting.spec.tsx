import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createAppTheme } from '@web/shared/theme/theme';

import { GradeScaleSetting } from './GradeScaleSetting';

vi.mock('@web/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@web/shared/api')>()),
  apiGet: () => new Promise(() => {})
}));

const renderSetting = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider i18n={i18n}>
        <ThemeProvider theme={createAppTheme('light')}>
          <GradeScaleSetting />
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

beforeAll(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('GradeScaleSetting', () => {
  it('waits with a placeholder rather than showing a scale nobody chose', () => {
    const { container } = renderSetting();

    expect(container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(2);
    expect(screen.queryByText(/French Scale/)).toBeNull();
  });
});
