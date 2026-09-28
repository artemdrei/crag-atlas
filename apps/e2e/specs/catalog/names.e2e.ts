import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import { cleanup, fixtureName, makeRegion } from '../../fixtures/catalog';
import { card, catalogPath, formWith } from '../../fixtures/ui';

/**
 * A name is Latin everywhere, and the local spelling is a field of its own.
 * The rule is written down three times — the form, the API and the column
 * check — and this is where the three are made to answer together.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;

test.beforeAll(async () => {
  region = await makeRegion('Names-Region');
});

test.afterAll(cleanup);

test('a Latin name written in another alphabet cannot be saved', async ({
  page
}) => {
  await page.goto(catalogPath());
  await card(page, region.name).click();

  const form = formWith(page, 'Archive region');

  await form.getByRole('textbox', { name: 'Latin name' }).fill('Скелі');

  await expect(page.getByText('Latin letters only')).toBeVisible();
  await expect(form.getByRole('button', { name: 'Save' })).toBeDisabled();
});

test('and the API refuses it too', async () => {
  await expect(
    api.post('/regions', {
      name: 'Скелі',
      nameLocal: 'Скелі',
      country: 'UA',
      rockType: 'Limestone',
      lat: 48.68291,
      lng: 26.56402
    })
  ).rejects.toThrow(/400/);
});

test('the local name writes the Latin one until it is written by hand', async ({
  page
}) => {
  await page.goto(catalogPath());
  await page.getByRole('button', { name: 'Add region' }).click();

  const form = formWith(page, 'Add region');
  const latin = form.getByRole('textbox', { name: 'Latin name' });

  await test.step('a name typed in Cyrillic arrives in Latin', async () => {
    await form
      .getByRole('textbox', { name: 'Name', exact: true })
      .fill('Скеля Довбуша');

    // The charmap is fetched on demand, so the box fills a moment after the
    // typing rather than with it — and what it fills with is the library's
    // business, not this spec's.
    await expect(latin).toHaveValue(/^[\w' -]+$/);
  });

  await test.step('a spelling of their own is left alone', async () => {
    await latin.fill(fixtureName('Names-By-Hand'));
    await form
      .getByRole('textbox', { name: 'Name', exact: true })
      .fill('Скеля Довбуша і Сокіл');

    await expect(latin).toHaveValue(fixtureName('Names-By-Hand'));
  });
});
