import { expect, test } from '@playwright/test';

import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  fixtureName,
  makeRegion,
  makeRoute,
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
 * Editing a catalog row. Every form is seeded from its row once, tells the
 * list around it while it holds unsaved edits, and goes live for everyone the
 * moment it is saved.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Edit-Region-Home');
  sector = await makeSector(region.id, 'Edit-Sector-Home');
  route = await makeRoute(sector.id, 'Edit-Route-Home');
});

test.afterAll(cleanup);

test('a region being edited says so on its card, until it is saved', async ({
  page
}) => {
  const renamed = fixtureName('Edit-Region-Renamed');

  await page.goto(catalogPath());
  await card(page, region.name).click();

  const form = formWith(page, 'Archive region');

  await test.step('an edit marks the card', async () => {
    await form
      .getByRole('textbox', { name: 'Name', exact: true })
      .fill(renamed);
    await expect(page.getByText('Unsaved')).toBeVisible();
  });

  await test.step('saving clears the mark and tells the user', async () => {
    await form.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Region saved')).toBeVisible();
    await expect(page.getByText('Unsaved')).toHaveCount(0);
  });

  await test.step('the new name is in the catalog for everyone', async () => {
    await page.goto(catalogPath());
    await expect(card(page, renamed)).toBeVisible();
  });

  region.name = renamed;
});

test('cancelling a sector form drops the edit and closes it', async ({
  page
}) => {
  await page.goto(regionPath(region.id));
  await card(page, sector.name).click();

  const form = formWith(page, 'Archive sector');

  await form
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill(fixtureName('Thrown-Away'));
  await form.getByRole('button', { name: 'Cancel' }).click();

  await page.goto(regionPath(region.id));

  await expect(card(page, sector.name)).toBeVisible();
  await expect(card(page, fixtureName('Thrown-Away'))).toHaveCount(0);
});

test('a sector keeps the coordinates pasted into it', async ({ page }) => {
  await page.goto(regionPath(region.id));
  await card(page, sector.name).click();

  const form = formWith(page, 'Archive sector');

  await form
    .getByRole('textbox', { name: 'Description' })
    .fill('Twenty minutes from the road');
  await page
    .getByRole('textbox', { name: 'Coordinates' })
    .fill('48.9226, 24.5008');
  await form.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Sector saved')).toBeVisible();

  await test.step('both survive a reload', async () => {
    await page.goto(regionPath(region.id));
    await card(page, sector.name).click();

    await expect(
      formWith(page, 'Archive sector').getByRole('textbox', {
        name: 'Description'
      })
    ).toHaveValue('Twenty minutes from the road');
    await expect(
      page.getByRole('textbox', { name: 'Coordinates' })
    ).toHaveValue(/48\.9226/);
  });
});

test('a route keeps the grade it is given', async ({ page }) => {
  await page.goto(editorPath(region.id, sector.id));
  await card(page, route.name).click();

  await test.step('the panel opens on the saved route', async () => {
    await expect(
      page.getByRole('button', { name: 'Save changes' })
    ).toBeDisabled();
  });

  await test.step('changing the grade makes it saveable', async () => {
    await page.getByRole('combobox', { name: 'Grade' }).click();
    await page.getByRole('option', { name: '7a', exact: true }).click();

    const save = page.getByRole('button', { name: 'Save changes' });

    await expect(save).toBeEnabled();
    await save.click();
  });

  await test.step('and the catalog shows it', async () => {
    await page.goto(editorPath(region.id, sector.id));
    await card(page, route.name).click();
    await expect(page.getByRole('combobox', { name: 'Grade' })).toHaveText(
      '7a'
    );
  });
});

test('a region cannot be saved once something it needs is cleared', async ({
  page
}) => {
  await page.goto(catalogPath());
  await card(page, region.name).click();

  const form = formWith(page, 'Archive region');
  const save = form.getByRole('button', { name: 'Save' });
  const local = form.getByRole('textbox', { name: 'Name', exact: true });

  await test.step('a region without its local name is not one', async () => {
    await local.fill('');
    await expect(save).toBeDisabled();
  });

  await test.step('putting it back opens the button again', async () => {
    await local.fill(fixtureName('Edit-Region-Renamed-Again'));
    await expect(save).toBeEnabled();
  });

  await test.step('and neither is one without a country', async () => {
    // The picker only shows its clear button while it has the focus, so the
    // field is clicked before the button is looked for — and the point editor
    // below carries a Clear of its own, so the country's is the first.
    await form.getByRole('combobox', { name: 'Country' }).click();
    await form.getByRole('button', { name: 'Clear' }).first().click();
    await expect(save).toBeDisabled();
  });
});

test('the card menu is the other way into editing', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: `Actions for ${region.name}` })
    .click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  await expect(page).toHaveURL(/[?&]edit=1/);

  await test.step('with that region already in the form', async () => {
    await expect(
      formWith(page, 'Archive region').getByRole('textbox', {
        name: 'Name',
        exact: true
      })
    ).toHaveValue(region.name);
  });
});
