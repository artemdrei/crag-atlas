import { describe, expect, it } from 'vitest';

import { resolveLoginEvent } from './resolveLoginEvent';

const now = new Date();
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000).toISOString();

describe('resolveLoginEvent', () => {
  it('reports nothing without an attempt from this tab', () => {
    expect(resolveLoginEvent({ createdAt: minutesAgo(0) })).toBe(undefined);
  });

  it('reports a signup when the sign-in follows the account', () => {
    expect(
      resolveLoginEvent({
        method: 'google',
        createdAt: minutesAgo(0),
        lastSignInAt: now.toISOString()
      })
    ).toEqual({ name: 'Signed Up', props: { method: 'google' } });
  });

  it('still reports a signup after a slow email code', () => {
    expect(
      resolveLoginEvent({
        method: 'email',
        createdAt: minutesAgo(5),
        lastSignInAt: now.toISOString()
      })
    ).toEqual({ name: 'Signed Up', props: { method: 'email' } });
  });

  it('reports a login when the account predates this session', () => {
    expect(
      resolveLoginEvent({
        method: 'email',
        createdAt: '2020-01-01T00:00:00Z',
        lastSignInAt: now.toISOString()
      })
    ).toEqual({ name: 'Logged In', props: { method: 'email' } });
  });
});
