import { test } from '@playwright/test';

import { env } from '../setup/env';
import { serviceClient, sessionState, signIn } from '../setup/session';
import { call } from './apiClient';

/**
 * A climber of the spec's own. The admin and the member are shared by every
 * worker, so anything that changes an account — its settings, its role, a
 * sign-out that ends all its sessions, a logbook stuffed for paging — happens
 * to one of these instead, and it is deleted afterwards.
 */
export interface Climber {
  id: string;
  email: string;
  storageState: ReturnType<typeof sessionState>;
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  status: (method: string, path: string) => Promise<number>;
  remove: () => Promise<void>;
}

export const makeClimber = async (tag: string): Promise<Climber> => {
  const stamp = `${Date.now().toString(36)}w${process.env.TEST_WORKER_INDEX ?? '0'}`;
  const email = `${tag.toLowerCase()}-${stamp}@crag-atlas.test`;
  const password = `${tag}-password`;
  const admin = serviceClient().auth.admin;

  const { data: made, error: madeError } = await admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (madeError) throw madeError;

  const session = await signIn(email, password);
  const token = async () => session.access_token;

  return {
    id: made.user.id,
    email,
    storageState: sessionState(session),
    get: (path) => call('GET', path, undefined, token),
    post: (path, body) => call('POST', path, body, token),
    status: async (method, path) =>
      (
        await fetch(`${env.apiUrl}${path}`, {
          method,
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
      ).status,
    // Their ascents, comments and roles cascade with the account, so a
    // spec removes the climber before the catalog cleanup erases the routes.
    remove: async () => {
      await admin.deleteUser(made.user.id);
    }
  };
};

export const signInAs = (climber: () => Climber) =>
  test.use({
    page: async ({ browser }, use) => {
      const page = await browser.newPage({
        storageState: climber().storageState
      });

      await use(page);
      await page.close();
    }
  });
