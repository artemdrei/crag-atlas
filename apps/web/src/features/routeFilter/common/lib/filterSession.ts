import { ROUTE_FILTER_PARAMS } from '../entities';

const FILTER_KEYS = Object.values(ROUTE_FILTER_PARAMS);

const searchByRegion = new Map<string, string>();

export const filterSearchOf = (params: URLSearchParams): string => {
  const filter = new URLSearchParams();

  for (const key of FILTER_KEYS) {
    const value = params.get(key);

    if (value) filter.set(key, value);
  }

  return filter.toString();
};

export const withFilterSearch = (
  params: URLSearchParams,
  search: string
): URLSearchParams => {
  for (const key of FILTER_KEYS) params.delete(key);
  for (const [key, value] of new URLSearchParams(search))
    params.set(key, value);

  return params;
};

export const sessionFilterOf = (idRegion: string) =>
  searchByRegion.get(idRegion);

export const rememberSessionFilter = (idRegion: string, search: string) => {
  searchByRegion.set(idRegion, search);
};
