import { domainFailure, wrapApiCall } from '@crag-atlas/utils';

import { supabase } from '@web/shared/supabase';

import type { ErrorResponseBody } from './ErrorResponseBody';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4001';

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const apiGet = <T>(path: string): Promise<T> =>
  wrapApiCall(`apiGet:${path}`, async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: await buildHeaders()
    });

    if (!response.ok) await throwResponseFailure(response, `GET ${path}`);

    return response.json() as Promise<T>;
  });

const throwResponseFailure = async (
  response: Response,
  label: string
): Promise<never> => {
  const body = (await response
    .json()
    .catch(() => null)) as ErrorResponseBody | null;

  throw domainFailure(
    body?.code ?? `http.${response.status}`,
    body?.message ?? `${label} failed with ${response.status}`,
    { status: response.status, data: body?.data }
  );
};

export const apiPost = <T>(path: string, payload: unknown): Promise<T> =>
  sendJson<T>('POST', path, payload);

export const apiPatch = <T>(path: string, payload: unknown): Promise<T> =>
  sendJson<T>('PATCH', path, payload);

export const apiPut = <T>(path: string, payload: unknown): Promise<T> =>
  sendJson<T>('PUT', path, payload);

export const apiDelete = (path: string): Promise<void> =>
  wrapApiCall(`apiDELETE:${path}`, async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: await buildHeaders()
    });

    if (!response.ok) await throwResponseFailure(response, `DELETE ${path}`);
  });

// Multipart: the browser appends the boundary, and any content type set here
// would replace it and break the parse.
export const apiUpload = <T>(
  method: 'POST' | 'PUT',
  path: string,
  body: FormData
): Promise<T> =>
  wrapApiCall(`api${method}:${path}`, async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: await buildAuthHeaders(),
      body
    });

    if (!response.ok) await throwResponseFailure(response, `${method} ${path}`);

    return response.json() as Promise<T>;
  });

const sendJson = <T>(
  method: 'POST' | 'PATCH' | 'PUT',
  path: string,
  payload: unknown
): Promise<T> =>
  wrapApiCall(`api${method}:${path}`, async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: await buildHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) await throwResponseFailure(response, `${method} ${path}`);

    return response.json() as Promise<T>;
  });

// Read at call time, never cached: supabase-js refreshes the token in place.
const buildHeaders = async (): Promise<HeadersInit> => ({
  'Content-Type': 'application/json',
  ...(await buildAuthHeaders())
});

const buildAuthHeaders = async (): Promise<Record<string, string>> => {
  // Offline, getSession() spends ~25 s trying to refresh an expired token
  // before it answers, and a saved region is served without one anyway.
  if (!navigator.onLine) return {};

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};
