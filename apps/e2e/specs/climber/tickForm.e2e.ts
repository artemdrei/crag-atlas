import { expect, type Page, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import { ascentsPanel, logTickButton, routePath } from '../../fixtures/ui';

/**
 * Everything the tick form asks, filled in and read back. The conditions are
 * read from Open-Meteo by the API, so the browser's lookup is answered here
 * instead: the spec must not depend on somebody else's forecast.
 */
test.describe.configure({ mode: 'serial' });

// The app's service worker answers API calls itself, and a request it serves
// never reaches `page.route` — so it is kept out of the way of the stub.
test.use({ serviceWorkers: 'block' });

interface SavedTick {
  note: string | null;
  climbedAt: string;
  attempts: number | null;
  rating: number | null;
  gradeVote: string | null;
  gradeOpinion: string | null;
  partnerName: string | null;
  weather: { temperatureC: number | null; humidityPct: number | null } | null;
}

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Form-Region');
  sector = await makeSector(region.id, 'Form-Sector');
  route = await makeRoute(sector.id, 'Form-Route');
});

test.afterAll(cleanup);

const answerWeather = (page: Page) =>
  page.route(/\/weather\?/, (request) =>
    request.fulfill({
      json: {
        hasPoint: true,
        weather: {
          observedAt: '2026-05-02T10:00:00Z',
          temperatureC: 14,
          humidityPct: 41,
          windSpeedMs: 3
        }
      }
    })
  );

// Known bug: the condition fields render with an empty label and unit — the
// labels are built with a `t` passed in as an argument, which the Lingui macro
// does not translate. Remove `test.fail` once the fields are named.
test('the conditions read at the sector are named fields', async ({ page }) => {
  test.fail();

  await answerWeather(page);
  await page.goto(routePath(region.id, sector.id, route.id));
  await logTickButton(page).click();

  const dialog = page.getByRole('dialog');

  await expect(
    dialog.getByRole('spinbutton', { name: 'Temperature' })
  ).toHaveValue('14', { timeout: 3_000 });
  await expect(
    dialog.getByRole('spinbutton', { name: 'Humidity' })
  ).toHaveValue('41', { timeout: 3_000 });
});

test('every answer in the form is kept with the ascent', async ({ page }) => {
  let attempts = 0;

  await answerWeather(page);
  await page.goto(routePath(region.id, sector.id, route.id));
  await logTickButton(page).click();

  const dialog = page.getByRole('dialog');

  await test.step('the conditions come from the sector', async () => {
    await dialog.getByLabel('Date').fill('2026-05-02');
    await expect(dialog.locator('input[type=number]').first()).toHaveValue(
      '14'
    );
  });

  await test.step('how it was climbed', async () => {
    const tries = dialog.getByRole('spinbutton', { name: 'Tries' });
    const before = Number(await tries.inputValue());

    await dialog.getByRole('button', { name: 'One more try' }).click();
    await dialog.getByRole('button', { name: 'One more try' }).click();
    await expect(tries).toHaveValue(String(before + 2));
    attempts = before + 2;
    await dialog.getByRole('combobox', { name: 'Partner' }).fill('Rope Gun');
  });

  await test.step('how hard and how good', async () => {
    await dialog.getByRole('button', { name: 'Harder' }).click();
    await dialog.getByRole('combobox', { name: 'Your grade' }).click();
    await page.getByRole('option', { name: '6a+', exact: true }).click();
    // The star is the radio's label; the input itself is visually hidden.
    const fourStars = dialog.getByRole('radio', { name: '4 of 5' });

    await dialog
      .locator(`label[for="${await fourStars.getAttribute('id')}"]`)
      .click();
    await expect(fourStars).toBeChecked();
    await dialog
      .getByRole('textbox', { name: 'Comment', exact: true })
      .fill('Form filled to the end');
  });

  await dialog.getByRole('button', { name: 'Log ascent' }).click();
  await expect(dialog).toBeHidden();

  await test.step('the card shows what was said', async () => {
    const panel = ascentsPanel(page);

    await expect(panel.getByText('Form filled to the end')).toBeVisible();
    await expect(panel.getByText('Rope Gun')).toBeVisible();
    await expect(panel.getByText('14°')).toBeVisible();
  });

  await test.step('and the API kept every answer', async () => {
    const [tick] = await api.get<SavedTick[]>(`/ticks/routes/${route.id}`);

    expect(tick).toMatchObject({
      note: 'Form filled to the end',
      climbedAt: '2026-05-02',
      attempts,
      rating: 4,
      gradeVote: '6a+',
      gradeOpinion: 'hard',
      partnerName: 'Rope Gun',
      weather: { temperatureC: 14, humidityPct: 41 }
    });
  });
});
