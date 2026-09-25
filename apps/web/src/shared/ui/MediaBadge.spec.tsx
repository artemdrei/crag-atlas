import type { ReactElement } from 'react';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { createAppTheme } from '@web/shared/theme/theme';

import { MediaBadge } from './MediaBadge';

const renderBadge = (ui: ReactElement) =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={createAppTheme('light')}>{ui}</ThemeProvider>
    </I18nProvider>
  );

beforeAll(() => {
  i18n.load('en', {});
  i18n.activate('en');
});

describe('MediaBadge', () => {
  it('prefers the video mark when there is both', () => {
    renderBadge(<MediaBadge hasPhoto hasVideo />);

    expect(screen.getByTitle('Has video')).toBeDefined();
    expect(screen.queryByTitle('Has photo')).toBeNull();
  });

  it('marks a photo when that is all there is', () => {
    renderBadge(<MediaBadge hasPhoto hasVideo={false} />);

    expect(screen.getByTitle('Has photo')).toBeDefined();
  });

  it('draws nothing without media', () => {
    const { container } = renderBadge(
      <MediaBadge hasPhoto={false} hasVideo={false} />
    );

    expect(container.firstChild).toBeNull();
  });
});
