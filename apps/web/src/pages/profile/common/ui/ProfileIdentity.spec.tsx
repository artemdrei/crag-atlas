import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createAppTheme } from '@web/shared/theme/theme';

import { ProfileIdentity } from './ProfileIdentity';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={createAppTheme('light')}>{ui}</ThemeProvider>);

describe('ProfileIdentity', () => {
  it('shows the name and the email of a Google user', () => {
    renderWithTheme(
      <ProfileIdentity
        email="cragatlasapp@gmail.com"
        name="Crag Atlas"
        avatarUrl="https://example.com/avatar.png"
      />
    );

    expect(screen.getByText('Crag Atlas')).toBeDefined();
    expect(screen.getByText('cragatlasapp@gmail.com')).toBeDefined();
  });

  it('falls back to initials of the email when there is no name', () => {
    renderWithTheme(<ProfileIdentity email="cragatlasapp@gmail.com" />);

    expect(screen.getByText('CR')).toBeDefined();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('renders the given avatar slot instead of the plain picture', () => {
    renderWithTheme(
      <ProfileIdentity
        email="cragatlasapp@gmail.com"
        avatarUrl="https://example.com/avatar.png"
        avatar={<button type="button">Change your photo</button>}
      />
    );

    expect(screen.getByText('Change your photo')).toBeDefined();
    expect(screen.queryByRole('img')).toBeNull();
  });
});
