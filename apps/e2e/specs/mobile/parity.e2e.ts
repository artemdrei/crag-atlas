import { expect, test } from '@playwright/test';

import { api } from '../../fixtures/apiClient';
import type { Row } from '../../fixtures/catalog';
import {
  cleanup,
  makeRegion,
  makeRoute,
  makeSector
} from '../../fixtures/catalog';
import {
  ascentsPanel,
  logTickButton,
  openTab,
  pickOption,
  routePath
} from '../../fixtures/ui';

/**
 * What a desktop spec covers and the phone renders with its own tree: the
 * profile's language and theme, rewriting an ascent from a sheet, and a
 * repeat logged from the phone.
 */
test.describe.configure({ mode: 'serial' });

let region: Row;
let sector: Row;
let route: Row;

test.beforeAll(async () => {
  region = await makeRegion('Phone-Parity-Region');
  sector = await makeSector(region.id, 'Phone-Parity-Sector');
  route = await makeRoute(sector.id, 'Phone-Parity-Route');

  await api.post('/ticks', {
    idRoute: route.id,
    ascentType: 'redpoint',
    climbedAt: '2026-05-01',
    note: 'Phone parity first send'
  });
});

test.afterAll(cleanup);

test('language and theme are switched from the phone', async ({
  page: phone
}) => {
  await phone.goto('/profile');

  await pickOption(phone, 'Language', 'Українська');
  await expect(phone.getByRole('link', { name: 'Логбук' })).toBeVisible();

  await phone.reload();
  await expect(phone.getByRole('link', { name: 'Логбук' })).toBeVisible();

  await pickOption(phone, 'Мова', 'English');
  await expect(phone.getByRole('link', { name: 'Logbook' })).toBeVisible();

  const dark = phone.getByRole('button', { name: 'Dark' });

  await dark.click();
  await phone.reload();
  await expect(phone.getByRole('button', { name: 'Dark' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await phone.getByRole('button', { name: 'Light' }).click();
});

test('an ascent is rewritten from a sheet', async ({ page: phone }) => {
  await phone.goto(routePath(region.id, sector.id, route.id));
  await openTab(phone, 'Logbook');

  const panel = ascentsPanel(phone);

  await panel.getByRole('button', { name: 'Ascent actions' }).click();
  await phone.getByRole('button', { name: 'Edit' }).click();
  await phone
    .getByRole('textbox', { name: 'Comment', exact: true })
    .fill('Phone parity, rewritten');
  await phone.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(panel.getByText('Phone parity, rewritten')).toBeVisible();
});

test('a repeat is logged from the phone', async ({ page: phone }) => {
  await phone.goto(routePath(region.id, sector.id, route.id));

  await expect(logTickButton(phone)).toHaveAccessibleName(
    'Log repeat (Sent · 1 time)'
  );
  await logTickButton(phone).click();

  await expect(
    phone.getByText('You have sent this route before')
  ).toBeVisible();
  await phone
    .getByRole('textbox', { name: 'Comment', exact: true })
    .fill('Phone parity lap');
  await phone
    .getByRole('button', { name: 'Log repeat', exact: true })
    .last()
    .click();

  await expect(logTickButton(phone)).toHaveAccessibleName(
    'Log repeat (Sent · 2 times)'
  );

  await openTab(phone, 'Logbook');
  await expect(ascentsPanel(phone).getByText('Phone parity lap')).toBeVisible();
});
