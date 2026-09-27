import { api, member, PIXEL_WEBP, WALL_WEBP } from './apiClient';

export interface Row {
  id: string;
  name: string;
}

type Scope = 'regions' | 'sectors' | 'routes';

// Every row a spec makes, in the order it was made. `cleanup` walks it
// backwards, so a setup that throws halfway still tidies up after itself.
//
// Names are how the specs find rows on screen, and the match is a substring,
// so no name may contain another: `…-Region` and `…-Region-Empty` would both
// answer to the first.
const created: { scope: Scope; id: string }[] = [];

const prefix = `TEST-${Date.now().toString(36)}`;

const record = async (scope: Scope, row: Promise<Row>): Promise<Row> => {
  const made = await row;

  created.push({ scope, id: made.id });

  return made;
};

/** The name a spec types into a form, and later looks for on screen. */
export const fixtureName = (name: string) => `${prefix}-${name}`;

/**
 * A row the spec created through the UI: found by the name it typed, and put
 * under `cleanup` like everything the builders make.
 */
const adopt = async (scope: Scope, path: string, name: string) => {
  const rows = await api.get<Row[]>(path);
  const made = rows.find((row) => row.name === fixtureName(name));

  if (!made) throw new Error(`No ${scope} named ${fixtureName(name)}`);

  created.push({ scope, id: made.id });

  return made;
};

export const adoptRegion = (name: string) => adopt('regions', '/regions', name);

export const adoptSector = (idRegion: string, name: string) =>
  adopt('sectors', `/regions/${idRegion}/sectors`, name);

export const adoptRoute = (idSector: string, name: string) =>
  adopt('routes', `/sectors/${idSector}/routes`, name);

export const makeRegion = (name: string) =>
  record(
    'regions',
    api.post<Row>('/regions', {
      name: `${prefix}-${name}`,
      province: 'Test province',
      rockType: 'Limestone'
    })
  );

export const makeSector = (idRegion: string, name: string) =>
  record(
    'sectors',
    api.post<Row>(`/regions/${idRegion}/sectors`, { name: `${prefix}-${name}` })
  );

export const makeRoute = (idSector: string, name: string) =>
  record(
    'routes',
    api.post<Row>(`/sectors/${idSector}/routes`, {
      name: `${prefix}-${name}`,
      grade: '6a',
      gradeScale: 'french',
      type: 'sport'
    })
  );

/** The three things climbers leave behind — the three the erase note counts. */
export const addAscent = (idRoute: string) =>
  api.post('/ticks', { idRoute, ascentType: 'redpoint' });

export const addComment = (idRoute: string) =>
  api.post(`/routes/${idRoute}/comments`, { body: 'Fixture comment' });

export const addLink = (
  idRoute: string,
  url = 'https://example.com/fixture-video'
) =>
  api.post<{ id: string }>(`/routes/${idRoute}/media`, { kind: 'video', url });

/** An upload rather than a link: it puts a real object in the media bucket. */
export const addPhoto = (idRoute: string) =>
  api.upload<{ id: string; url: string }>(
    `/routes/${idRoute}/media/photo`,
    PIXEL_WEBP
  );

/**
 * A photo on a sector, uploaded the way the editor uploads one. Cleanup takes
 * it with the sector, so it is not recorded separately.
 */
export const addTopo = (idSector: string) =>
  api.upload<{ id: string }>(`/sectors/${idSector}/topos`, WALL_WEBP, {
    width: '1600',
    height: '1200'
  });

/** A line for a route on that photo — [x, y] pairs in the 0..1 photo space. */
export const addLine = (
  idRoute: string,
  idTopo: string,
  points: [number, number][]
) => api.put(`/routes/${idRoute}/topos/${idTopo}/line`, { points });

const forget = async (call: Promise<unknown>) => {
  try {
    await call;
  } catch {
    // Scenarios erase rows for good, so "already gone" is the expected answer
    // for part of what cleanup walks over.
  }
};

const eraseRoute = async (id: string) => {
  // The route's ascents come from everyone, but `DELETE /ticks/:id` only obeys
  // the account that logged one, so each is offered to both and the refusal is
  // swallowed.
  for (const tick of await api
    .get<{ id: string }[]>(`/routes/${id}/ticks`)
    .catch(() => []))
    for (const client of [api, member])
      await forget(client.delete(`/ticks/${tick.id}`));

  for (const comment of await api
    .get<{ id: string }[]>(`/routes/${id}/comments`)
    .catch(() => []))
    await forget(api.delete(`/routes/${id}/comments/${comment.id}`));

  for (const media of await api
    .get<{ id: string }[]>(`/routes/${id}/media`)
    .catch(() => []))
    await forget(api.delete(`/routes/${id}/media/${media.id}`));

  await forget(api.delete(`/routes/${id}`));
  await forget(api.delete(`/routes/${id}/permanent`));
};

/** Deepest row first, best-effort. Every spec file ends with this. */
export const cleanup = async () => {
  for (const { scope, id } of [...created].reverse()) {
    if (scope === 'routes') {
      await eraseRoute(id);
      continue;
    }

    await forget(api.delete(`/${scope}/${id}`));
    await forget(api.delete(`/${scope}/${id}/permanent`));
  }

  created.length = 0;
};
