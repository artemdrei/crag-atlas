import { expect } from '@playwright/test';

import { serviceClient } from '../setup/session';

/**
 * The local stack hands every email to Mailpit instead of sending it, so a
 * sign-in code is read back from its API. Only the local stack has one: on
 * the hosted project the same email goes out through the real provider, which
 * no test here can see.
 */
const MAILBOX_URL = process.env.MAILBOX_URL ?? 'http://127.0.0.1:55324';

interface Message {
  ID: string;
}

interface MessageDetail {
  Text: string;
}

const CODE_PATTERN = /\b(\d{6})\b/;

export const readSignInCode = async (email: string): Promise<string> => {
  let code: string | undefined;

  await expect
    .poll(
      async () => {
        const search = await fetch(
          `${MAILBOX_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`
        );
        const { messages } = (await search.json()) as { messages: Message[] };
        const latest = messages[0];

        if (!latest) return false;

        const detail = await fetch(
          `${MAILBOX_URL}/api/v1/message/${latest.ID}`
        );
        const { Text } = (await detail.json()) as MessageDetail;

        code = CODE_PATTERN.exec(Text)?.[1];

        return !!code;
      },
      { message: `No sign-in code reached ${email}`, timeout: 15_000 }
    )
    .toBe(true);

  if (!code) throw new Error(`No sign-in code reached ${email}`);

  return code;
};

export const signInEmail = (tag: string) =>
  `${tag.toLowerCase()}-${Date.now().toString(36)}w${process.env.TEST_WORKER_INDEX ?? '0'}@crag-atlas.test`;

export const removeAccount = async (email: string): Promise<void> => {
  const admin = serviceClient().auth.admin;
  const { data } = await admin.listUsers({ perPage: 1000 });
  const user = data?.users.find((row) => row.email === email);

  if (user) await admin.deleteUser(user.id);
};
