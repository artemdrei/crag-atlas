import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { Me } from '@crag-atlas/api';
import type { Session } from '@supabase/supabase-js';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';
import { GradePreferenceProvider } from '@web/shared/lib';
import { supabase } from '@web/shared/supabase';

export type Role = 'guest' | 'user' | 'admin';

const ROLE_RANK: Record<Role, number> = { guest: 0, user: 1, admin: 2 };

const UserContext = createContext<{
  role: Role;
  /** The caller's own id, for "is this mine?" checks on public rows. */
  idUser: string | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (required: Role) => boolean;
  signOut: () => Promise<void>;
} | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    // Fires INITIAL_SESSION right away with the persisted session, so there's
    // no separate getSession() call — and no await inside the callback, which
    // deadlocks the auth client.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: me, isLoading: isRoleLoading } = useApiQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => apiGet<Me>('/me'),
    enabled: !!session
  });

  // The session comes back from storage well before `/me` answers, so a guard
  // that only waited for the session would see an admin as a plain user and
  // redirect them away from their own page on every reload.
  const isLoading = isSessionLoading || isRoleLoading;

  const value = useMemo(() => {
    const role: Role = me?.isAdmin ? 'admin' : session ? 'user' : 'guest';

    return {
      role,
      idUser: session?.user.id ?? null,
      session,
      isAuthenticated: !!session,
      isLoading,
      hasRole: (required: Role) => ROLE_RANK[role] >= ROLE_RANK[required],
      signOut: async () => {
        await supabase.auth.signOut();
      }
    };
  }, [session, isLoading, me]);

  // Grades are shown in the system this user picked, so the preference has to
  // reach every badge on the page, not just the profile screen.
  const gradePreference = useMemo(
    () => ({
      route: me?.gradeScaleRoute ?? 'french',
      boulder: me?.gradeScaleBoulder ?? 'vscale'
    }),
    [me]
  );

  return (
    <UserContext.Provider value={value}>
      <GradePreferenceProvider preference={gradePreference}>
        {children}
      </GradePreferenceProvider>
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
