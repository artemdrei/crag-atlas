import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { identifyUser, resetAnalytics, track } from '@crag-atlas/analytics';
import type { Me } from '@crag-atlas/api';
import type { Session } from '@supabase/supabase-js';

import { deleteAllOfflineRegions } from '@web/features/offlineRegions';
import { apiGet, QUERY_KEYS, queryClient, useApiQuery } from '@web/shared/api';
import {
  GradePreferenceProvider,
  resolveLoginEvent,
  takeLoginAttempt
} from '@web/shared/lib';
import { setAnalyticsAuthState } from '@web/shared/lib/analytics/amplitude';
import { supabase } from '@web/shared/supabase';

export type Role = 'guest' | 'user' | 'admin';

const ROLE_RANK: Record<Role, number> = { guest: 0, user: 1, admin: 2 };

const UserContext = createContext<{
  role: Role;
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
  // onAuthStateChange also fires on a restored session, a token refresh and a
  // tab focus, so only a new id is a new identity.
  const idIdentified = useRef<string | null>(null);

  useEffect(() => {
    // Fires INITIAL_SESSION right away with the persisted session, so no
    // getSession() call — and no await in the callback, which deadlocks it.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setIsSessionLoading(false);

      setAnalyticsAuthState(!!nextSession);

      if (nextSession?.user) {
        if (nextSession.user.id !== idIdentified.current) {
          idIdentified.current = nextSession.user.id;
          identifyUser({
            idUser: nextSession.user.id,
            email: nextSession.user.email ?? undefined
          });
        }

        // The marker exists only where this tab started a login, so a
        // restored session reports nothing.
        const loginEvent = resolveLoginEvent({
          method: takeLoginAttempt(),
          createdAt: nextSession.user.created_at,
          lastSignInAt: nextSession.user.last_sign_in_at
        });

        if (loginEvent) track(loginEvent);

        return;
      }

      // reset() regenerates the device id, and INITIAL_SESSION fires
      // session-less on every anonymous load.
      if (event === 'SIGNED_OUT') {
        track({ name: 'Logged Out' });
        // The cache is persisted, so the next person on this device would
        // otherwise open the app on this climber's logbook.
        queryClient.clear();
        deleteAllOfflineRegions();
        idIdentified.current = null;
        resetAnalytics();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const {
    data: me,
    isLoading: isMeLoading,
    isPaused: isMePaused
  } = useApiQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: () => apiGet<Me>('/me'),
    enabled: !!session
  });

  // The session comes back from storage well before `/me` answers, so a guard
  // waiting on the session alone would see an admin as a plain user.
  // Offline, `/me` waits for the network indefinitely; members-only pages
  // (the saved regions live on the profile) must not wait with it.
  const isRoleLoading = isMeLoading && !isMePaused;
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
