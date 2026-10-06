import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

import { env } from '../setup/env';
import { signIn } from '../setup/session';

const tokens = new Map<string, string>();

const tokenFor = async (email: string, password: string): Promise<string> => {
  const known = tokens.get(email);

  if (known) return known;

  const { access_token } = await signIn(email, password);

  tokens.set(email, access_token);

  return access_token;
};

const accessToken = () => tokenFor(env.adminEmail, env.adminPassword);

/** The same calls as `api`, made by the ordinary climber. */
const memberToken = () => tokenFor(env.memberEmail, env.memberPassword);

export const call = async <T>(
  method: string,
  path: string,
  body?: unknown,
  as: () => Promise<string> = accessToken
): Promise<T> => {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await as()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!response.ok)
    throw new Error(
      `${method} ${path} → ${response.status} ${await response.text()}`
    );

  return response.status === 204 ? (undefined as T) : await response.json();
};

/** The one-pixel WebP the fixture uploads; the API rejects anything else. */
export const PIXEL_WEBP = new URL('./pixel.webp', import.meta.url).pathname;

/**
 * A 1600×1200 WebP for the topo editor: the drawing surface is the photo on
 * screen, so a one-pixel image leaves nothing to point at.
 */
export const WALL_WEBP = new URL('./wall.webp', import.meta.url).pathname;

const upload = async <T>(
  path: string,
  file: string,
  fields: Record<string, string> = {}
): Promise<T> => {
  const body = new FormData();

  body.set(
    'file',
    new Blob([await readFile(file)], { type: 'image/webp' }),
    basename(file)
  );

  for (const [name, value] of Object.entries(fields)) body.set(name, value);

  const response = await fetch(`${env.apiUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}` },
    body
  });

  if (!response.ok)
    throw new Error(
      `POST ${path} → ${response.status} ${await response.text()}`
    );

  return await response.json();
};

export const member = {
  get: <T>(path: string) => call<T>('GET', path, undefined, memberToken),
  post: <T>(path: string, body?: unknown) =>
    call<T>('POST', path, body, memberToken),
  delete: <T>(path: string) => call<T>('DELETE', path, undefined, memberToken)
};

export const api = {
  upload,
  /** The raw response of a multipart POST, for the scenarios that assert a refusal. */
  rawUpload: async (path: string, body: FormData) =>
    fetch(`${env.apiUrl}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await accessToken()}` },
      body
    }),
  get: <T>(path: string) => call<T>('GET', path),
  post: <T>(path: string, body?: unknown) => call<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => call<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => call<T>('PATCH', path, body),
  delete: <T>(path: string) => call<T>('DELETE', path),
  /** The raw response, for the scenarios that assert a refusal. */
  raw: async (method: string, path: string) =>
    fetch(`${env.apiUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${await accessToken()}` }
    })
};
