import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiGet } from './httpClient';

const signOut = vi.fn(async (_options?: unknown) => ({ error: null }));
const getUser = vi.fn(
  async (): Promise<{ error: unknown }> => ({
    error: new AuthApiError('Session not found', 403, 'session_not_found')
  })
);

vi.mock('@web/shared/supabase', () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: { access_token: 'stale-token' } }
      }),
      getUser: () => getUser(),
      signOut: (options: unknown) => signOut(options)
    }
  }
}));

const answer = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }));

const unauthorized = () =>
  answer(401, { code: 'UNAUTHORIZED', message: 'Not authenticated' });

describe('httpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    signOut.mockClear();
    getUser.mockClear();
  });

  it('drops the local session once Supabase confirms it is revoked', async () => {
    vi.stubGlobal('fetch', unauthorized());

    await expect(apiGet('/me')).rejects.toMatchObject({
      kind: 'domain',
      code: 'UNAUTHORIZED'
    });
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('checks the session once for concurrent 401 answers', async () => {
    vi.stubGlobal('fetch', unauthorized());

    await Promise.allSettled([apiGet('/me'), apiGet('/ticks')]);

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when Supabase Auth cannot be reached', async () => {
    vi.stubGlobal('fetch', unauthorized());
    getUser.mockResolvedValueOnce({
      error: new AuthRetryableFetchError('Failed to fetch', 0)
    });

    await expect(apiGet('/me')).rejects.toMatchObject({
      code: 'UNAUTHORIZED'
    });
    expect(signOut).not.toHaveBeenCalled();
  });

  it('keeps the session when Supabase still accepts it', async () => {
    vi.stubGlobal('fetch', unauthorized());
    getUser.mockResolvedValueOnce({ error: null });

    await expect(apiGet('/me')).rejects.toMatchObject({
      code: 'UNAUTHORIZED'
    });
    expect(signOut).not.toHaveBeenCalled();
  });

  it('keeps the session on any other failure', async () => {
    vi.stubGlobal('fetch', answer(403, { code: 'FORBIDDEN', message: 'No' }));

    await expect(apiGet('/admins')).rejects.toMatchObject({
      code: 'FORBIDDEN'
    });
    expect(getUser).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });
});
