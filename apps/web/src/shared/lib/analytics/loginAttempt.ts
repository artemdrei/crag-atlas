import type { LoginMethod } from '@crag-atlas/analytics';

const KEY = 'login-attempt-method';

// Survives the full-page hop to the OAuth provider, which router state cannot.
// Read once, so a later reload does not report as a fresh login.
export const rememberLoginAttempt = (method: LoginMethod) => {
  try {
    sessionStorage.setItem(KEY, method);
  } catch {
    // A private window can refuse storage; the login itself still works.
  }
};

export const takeLoginAttempt = (): LoginMethod | undefined => {
  try {
    const method = sessionStorage.getItem(KEY);

    sessionStorage.removeItem(KEY);

    return method === 'google' || method === 'email' ? method : undefined;
  } catch {
    return undefined;
  }
};
