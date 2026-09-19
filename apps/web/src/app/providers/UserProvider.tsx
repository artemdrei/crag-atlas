import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { Me } from '@crag-atlas/api';
import type { Session } from '@supabase/supabase-js';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';
import { supabase } from '@web/shared/supabase';

export type Role = 'guest' | 'user' | 'admin';

const ROLE_RANK: Record<Role, number> = { guest: 0, user: 1, admin: 2 };

const UserContext = createContext<{
  role: Role;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (required: Role) => boolean;
  signOut: () => Promise<void>;
} | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fires INITIAL_SESSION right away with the persisted session, so there's
    // no separate getSession() call — and no await inside the callback, which
    // deadlocks the auth client.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // The role lives in the database, next to the RLS policies that enforce it —
  // never in a flag the client could set for itself.
  const { data: me } = useApiQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => apiGet<Me>('/me'),
    enabled: !!session
  });

  const value = useMemo(() => {
    const role: Role = me?.isAdmin ? 'admin' : session ? 'user' : 'guest';

    return {
      role,
      session,
      isAuthenticated: !!session,
      isLoading,
      hasRole: (required: Role) => ROLE_RANK[role] >= ROLE_RANK[required],
      signOut: async () => {
        await supabase.auth.signOut();
      }
    };
  }, [session, isLoading, me]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
