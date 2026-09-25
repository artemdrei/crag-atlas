import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  adoptRegion,
  adoptRoute,
  adoptSector,
  cleanup,
  fixtureName,
  makeRegion,
  makeSector
} from '../../fixtures/catalog';
import {
  card,
  catalogPath,
  editorPath,
  formWith,
  regionPath
} from '../../fixtures/ui';

/**
 * Creating a catalog row. The forms are deliberately thin — a name is the only
 * thing a region or a sector insists on, a route also wants a grade — and what
 * they all share is that the button stays out of reach until they have it.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;

test.beforeAll(async () => {
  region = await makeRegion('Create-Region-Home');
  sector = await makeSector(region.id, 'Create-Sector-Home');
});

test.afterAll(cleanup);

test('a region cannot be created without a name', async ({ page }) => {
  const name = 'Create-Region-Made';

  await page.goto(catalogPath());
  await page.getByRole('button', { name: 'Add region' }).click();

  const form = formWith(page, 'Add region');
  const submit = form.getByRole('button', { name: 'Add region' });

  await test.step('the button waits for a name', async () => {
    await form.getByRole('textbox', { name: 'Province' }).fill('Test province');
    await form.getByRole('textbox', { name: 'Rock type' }).fill('Limestone');
    await expect(submit).toBeDisabled();
  });

  await test.step('and a name of spaces does not count', async () => {
    await form.getByRole('textbox', { name: 'Name' }).fill('   ');
    await expect(submit).toBeDisabled();
  });

  await test.step('the name is trimmed on the way in', async () => {
    await form
      .getByRole('textbox', { name: 'Name' })
      .fill(`  ${fixtureName(name)}  `);
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(
      page.getByText(`Region ${fixtureName(name)} created`)
    ).toBeVisible();
  });

  await test.step('the region is in the catalog', async () => {
    const made = await adoptRegion(name);

    expect(made.name).toBe(fixtureName(name));

    await page.goto(catalogPath());
    await expect(card(page, made.name)).toBeVisible();
  });
});

test('closing the create form makes nothing', async ({ page }) => {
  const name = fixtureName('Create-Region-Abandoned');

  await page.goto(catalogPath());
  await page.getByRole('button', { name: 'Add region' }).click();

  const form = formWith(page, 'Add region');

  await form.getByRole('textbox', { name: 'Name' }).fill(name);
  await form.getByRole('button', { name: 'Close' }).click();

  await test.step('the sidebar is back to its hint', async () => {
    await expect(page.getByText('Pick a region on the left')).toBeVisible();
  });

  await test.step('and the catalog never heard of it', async () => {
    await page.goto(catalogPath());
    await expect(card(page, name)).toHaveCount(0);
  });
});

test('a new sector is the one being edited', async ({ page }) => {
  const name = 'Create-Sector-Made';

  await page.goto(regionPath(region.id));
  await page.getByRole('button', { name: 'Add sector' }).click();

  const form = formWith(page, 'Add sector');

  await form.getByRole('textbox', { name: 'Name' }).fill(fixtureName(name));
  await form
    .getByRole('textbox', { name: 'Description' })
    .fill('Fixture description');
  await form.getByRole('button', { name: 'Add sector' }).click();

  await expect(
    page.getByText(`Sector ${fixtureName(name)} created`)
  ).toBeVisible();

  await test.step('the sidebar moved on to its edit form', async () => {
    await expect(
      page.getByRole('button', { name: 'Archive sector' })
    ).toBeVisible();
    await expect(
      formWith(page, 'Archive sector').getByRole('textbox', { name: 'Name' })
    ).toHaveValue(fixtureName(name));
  });

  await adoptSector(region.id, name);
});

test('a route cannot be created without a grade', async ({ page }) => {
  const name = 'Create-Route-Made';

  await page.goto(editorPath(region.id, sector.id));
  await page.getByRole('button', { name: 'Add route' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(fixtureName(name));

  const create = page.getByRole('button', { name: 'Create route' });

  await test.step('a name alone is not enough', async () => {
    await expect(create).toBeDisabled();
  });

  await test.step('picking a grade makes it creatable', async () => {
    await page.getByRole('combobox', { name: 'Grade' }).click();
    await page.getByRole('option', { name: '6a', exact: true }).click();
    await expect(create).toBeEnabled();
    await create.click();
  });

  await test.step('the route is saved and the button says so', async () => {
    await expect(
      page.getByRole('button', { name: 'Save changes' })
    ).toBeVisible();

    const made = await adoptRoute(sector.id, name);

    expect(made.name).toBe(fixtureName(name));
  });
});
