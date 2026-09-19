import { domainFailure, wrapApiCall } from '@crag-atlas/utils';

import { supabase } from '@web/shared/supabase';

import type { ErrorResponseBody } from './ErrorResponseBody';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4001';

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
  wrapApiCall(`apiPost:${path}`, async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: await buildHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) await throwResponseFailure(response, `POST ${path}`);

    return response.json() as Promise<T>;
  });

// Sent on every call, not just the authenticated ones: public endpoints
// ignore it, and the alternative is each call site knowing which is which.
// Read at call time, never cached: supabase-js refreshes the token in place.
const buildHeaders = async (): Promise<HeadersInit> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return headers;
};
