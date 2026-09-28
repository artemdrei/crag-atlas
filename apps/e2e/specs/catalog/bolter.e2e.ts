import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  addPhoto,
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { card, editorPath, routePath } from '../../fixtures/ui';

/**
 * Who bolted a route. The columns are new, but the migration that added them
 * dropped and rebuilt `routes_with_stats` to reach them — so the first thing
 * to answer for is everything that view already carried.
 */
test.describe.configure({ mode: 'serial' });

const TYPED_BOLTER = 'Ivan Petrenko';
const BOLTED_YEAR = 2019;
const EARLIEST_YEAR = 1900;

interface RouteRead {
  id: string;
  idBolter: string | null;
  bolterName: string | null;
  boltedYear: number | null;
  rating: number | null;
  ratingVotes: number | null;
  ascentsCount: number | null;
  onsightCount: number | null;
  hasPhoto: boolean;
}

let region: Row;
let sector: Row;
let route: Row;
let idMember: string;
let memberName: string;

/** What `PATCH /routes/:idRoute` insists on, whatever the change is about. */
const requiredFields = (name: string) => ({
  name,
  nameLocal: name,
  grade: '6a',
  gradeScale: 'french',
  type: 'sport'
});

test.beforeAll(async () => {
  region = await makeRegion('Bolter-Region');
  sector = await makeSector(region.id, 'Bolter-Sector');
  route = await makeRoute(sector.id, 'Bolter-Plain');

  const [member] = await api.get<{ id: string; displayName: string }[]>(
    '/users?q=e2e-member'
  );

  if (!member) throw new Error('The member fixture has no public user row');

  idMember = member.id;
  memberName = member.displayName;
});

test.afterAll(cleanup);

test('the rebuilt view still answers for everything it carried', async () => {
  const counted = await makeRoute(sector.id, 'Bolter-Counted');

  await api.post('/ticks', {
    idRoute: counted.id,
    ascentType: 'onsight',
    rating: 4
  });
  await addPhoto(counted.id);

  const read = await api.get<RouteRead>(`/routes/${counted.id}`);

  await test.step('the aggregates it computes survived the rebuild', () => {
    expect(read.rating).toBeCloseTo(4);
    expect(read).toMatchObject({
      ratingVotes: 1,
      ascentsCount: 1,
      onsightCount: 1,
      hasPhoto: true
    });
  });

  await test.step('and the bolter join drops nobody', async () => {
    // `left join users`: were it a plain join, every route nobody claimed —
    // which is most of the catalog — would fall out of the view entirely.
    const listed = await api.get<Row[]>(`/sectors/${sector.id}/routes`);

    expect(listed.map(({ id }) => id)).toContain(counted.id);
    expect(read.idBolter).toBeNull();
    expect(read.bolterName).toBeNull();
  });
});

test('the API keeps the bolter to one person and one believable year', async () => {
  const claimed = await makeRoute(sector.id, 'Bolter-Claimed');

  await test.step('a picked climber drops the typed name rather than joining it', async () => {
    await api.patch(`/routes/${claimed.id}`, {
      ...requiredFields(claimed.name),
      idBolter: idMember,
      bolterName: TYPED_BOLTER,
      boltedYear: BOLTED_YEAR
    });

    const read = await api.get<RouteRead>(`/routes/${claimed.id}`);

    expect(read.idBolter).toBe(idMember);
    expect(read.bolterName).not.toBe(TYPED_BOLTER);
  });

  await test.step('and the name read back is the account it points at', async () => {
    const read = await api.get<RouteRead>(`/routes/${claimed.id}`);

    expect(read.bolterName).toBe(memberName);
    expect(read.boltedYear).toBe(BOLTED_YEAR);
  });

  for (const boltedYear of [EARLIEST_YEAR - 1, 2101, 2019.5]) {
    await test.step(`${boltedYear} is turned away before the column sees it`, async () => {
      await expect(
        api.patch(`/routes/${route.id}`, {
          ...requiredFields(route.name),
          boltedYear
        })
      ).rejects.toThrow(/400/);
    });
  }

  await test.step('while the earliest year it accepts goes through', async () => {
    await api.patch(`/routes/${route.id}`, {
      ...requiredFields(route.name),
      boltedYear: EARLIEST_YEAR
    });

    const read = await api.get<RouteRead>(`/routes/${route.id}`);

    expect(read.boltedYear).toBe(EARLIEST_YEAR);
  });
});

test('the editor writes a bolter and the route page says who it is', async ({
  page
}) => {
  const bolted = await makeRoute(sector.id, 'Bolter-Edited');

  await page.goto(editorPath(region.id, sector.id));
  await card(page, bolted.name).click();

  await test.step('a name and a year are enough to save', async () => {
    await page.getByRole('textbox', { name: 'Or a name' }).fill(TYPED_BOLTER);
    await page.getByRole('textbox', { name: 'Year' }).fill(`${BOLTED_YEAR}`);

    const save = page.getByRole('button', { name: 'Save changes' });

    await expect(save).toBeEnabled();
    await save.click();
    await expect(page.getByText('Route saved')).toBeVisible();
  });

  await test.step('and the route page prints both', async () => {
    await page.goto(routePath(region.id, sector.id, bolted.id));

    await expect(page.getByText('Bolted by:')).toBeVisible();
    await expect(
      page.getByText(`${TYPED_BOLTER}, ${BOLTED_YEAR}`)
    ).toBeVisible();
  });

  await test.step('a route whose year is all anyone knows says only that', async () => {
    await api.patch(`/routes/${bolted.id}`, {
      ...requiredFields(bolted.name),
      bolterName: null,
      boltedYear: BOLTED_YEAR
    });

    await page.goto(routePath(region.id, sector.id, bolted.id));

    await expect(page.getByText(`Bolted in ${BOLTED_YEAR}`)).toBeVisible();
    await expect(page.getByText('Bolted by:')).toHaveCount(0);
  });
});
