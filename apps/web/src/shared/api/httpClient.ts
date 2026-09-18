import { domainFailure, wrapApiCall } from '@crag-atlas/utils';

import type { ErrorResponseBody } from './ErrorResponseBody';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiGet = <T>(path: string): Promise<T> =>
  wrapApiCall(`apiGet:${path}`, async () => {
    const response = await fetch(`${API_BASE_URL}${path}`);

    if (!response.ok) {
      const body = (await response
        .json()
        .catch(() => null)) as ErrorResponseBody | null;

      throw domainFailure(
        body?.code ?? `http.${response.status}`,
        body?.message ?? `GET ${path} failed with ${response.status}`,
        { status: response.status, data: body?.data }
      );
    }

    return response.json() as Promise<T>;
  });
