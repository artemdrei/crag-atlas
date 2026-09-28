import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EditModeProvider, useEditModeInUrl } from './EditModeProvider';
import type { Role } from './UserProvider';

const ROLE_RANK: Record<Role, number> = { guest: 0, user: 1, admin: 2 };

let role: Role = 'guest';

vi.mock('./UserProvider', () => ({
  useUser: () => ({
    hasRole: (required: Role) => ROLE_RANK[role] >= ROLE_RANK[required]
  })
}));

const renderEditMode = (initial: string, as: Role) => {
  role = as;

  const wrapper = ({ children }: PropsWithChildren) => (
    <MemoryRouter initialEntries={[initial]}>
      <EditModeProvider>{children}</EditModeProvider>
    </MemoryRouter>
  );

  return renderHook(() => useEditModeInUrl(), { wrapper });
};

describe('useEditModeInUrl', () => {
  it('opens the editor for an admin who carries the flag', () => {
    const { result } = renderEditMode('/?edit=1', 'admin');

    expect(result.current.isEditing).toBe(true);
  });

  it('leaves it closed for an admin without the flag', () => {
    const { result } = renderEditMode('/', 'admin');

    expect(result.current.isEditing).toBe(false);
  });

  // The flag is a URL anyone can type, so the role decides, not the address.
  it.each<Role>(['guest', 'user'])('refuses the flag to a %s', (as) => {
    const { result } = renderEditMode('/?edit=1', as);

    expect(result.current.isEditing).toBe(false);
  });

  it('shows the archive to an admin who asks for both', () => {
    const { result } = renderEditMode('/?edit=1&archive=1', 'admin');

    expect(result.current.isArchiveShown).toBe(true);
  });

  it('keeps the archive out of reach of everyone else', () => {
    const { result } = renderEditMode('/?edit=1&archive=1', 'user');

    expect(result.current.isArchiveShown).toBe(false);
  });
});
