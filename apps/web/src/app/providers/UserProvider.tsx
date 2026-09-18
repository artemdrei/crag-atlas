import { createContext, useContext, useMemo, useState } from 'react';

export type Role = 'guest' | 'user' | 'admin';

const STORAGE_KEY = 'crag-atlas:role';

const ROLE_RANK: Record<Role, number> = { guest: 0, user: 1, admin: 2 };

const UserContext = createContext<{
  role: Role;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  hasRole: (required: Role) => boolean;
} | null>(null);

const readStoredRole = (): Role => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'user' || stored === 'admin' ? stored : 'guest';
  } catch {
    return 'guest';
  }
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<Role>(readStoredRole);

  const setRole = (next: Role) => {
    setRoleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const value = useMemo(
    () => ({
      role,
      isAuthenticated: role !== 'guest',
      setRole,
      hasRole: (required: Role) => ROLE_RANK[role] >= ROLE_RANK[required]
    }),
    [role]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
