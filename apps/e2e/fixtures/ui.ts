import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { api } from './apiClient';

/**
 * The confirm button repeats the name of the button that opened the dialog,
 * and MUI renders it in a portal — so it is reached through the dialog rather
 * than by position on the page.
 */
export const confirm = (page: Page, name: string) =>
  page.getByRole('dialog').getByRole('button', { name, exact: true }).click();

/**
 * Erasing is a mutation the page fires and forgets: the row leaves the list
 * before the request lands, so the API is polled rather than read once.
 */
export const expectErased = (path: string) =>
  expect
    .poll(async () => (await api.raw('GET', path)).status, { timeout: 10_000 })
    .toBe(404);

/**
 * Archiving is fired and forgotten too: the sidebar closes before the request
 * lands, so a spec that archives through the UI and then talks to the API has
 * to wait for the row to actually carry its mark.
 */
export const expectArchived = (path: string) =>
  expect
    .poll(async () => (await api.get<{ isDeleted: boolean }>(path)).isDeleted, {
      timeout: 10_000
    })
    .toBe(true);

export const catalogPath = (isArchiveShown = false) =>
  `/?edit=1${isArchiveShown ? '&archive=1' : ''}`;

export const regionPath = (idRegion: string, isArchiveShown = false) =>
  `/regions/${idRegion}?edit=1${isArchiveShown ? '&archive=1' : ''}`;

export const editorPath = (
  idRegion: string,
  idSector: string,
  isArchiveShown = false
) =>
  `/regions/${idRegion}/sectors/${idSector}/edit${
    isArchiveShown ? '?archive=1' : ''
  }`;

/**
 * A tab on the route page. The strip mounts before the app has finished
 * attaching its handlers, so a click that lands too early is swallowed and
 * the page stays on the tab it opened with — the click is repeated until the
 * tab is the selected one.
 */
export const openTab = async (page: Page, name: string) => {
  const tab = page.getByRole('tab', { name });

  await expect(async () => {
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  }).toPass({ timeout: 15_000 });
};

export const sectorPath = (idRegion: string, idSector: string) =>
  `/regions/${idRegion}/sectors/${idSector}`;

export const routePath = (
  idRegion: string,
  idSector: string,
  idRoute: string
) => `/regions/${idRegion}/sectors/${idSector}/routes/${idRoute}`;

/**
 * Catalog cards and topo editor rows are both buttons, but their accessible
 * names are built differently — a card opens with the row's name, an editor
 * row puts its position first — so the match is not anchored. Fixture names
 * must therefore never contain one another.
 */
/**
 * The form holding a given button. Several panels can be on screen at once —
 * a region's own fields next to the form that creates a sector — and they
 * label their inputs the same way.
 */
export const formWith = (page: Page, button: string) =>
  page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: button, exact: true }) });

/**
 * A route in the topo editor's list. Once it carries a line, its badge on the
 * photo answers to the same name, and the stage column comes first — so the
 * row is the last match.
 */
export const routeRow = (page: Page, name: string) =>
  page.getByRole('button', { name: new RegExp(name) }).last();

/**
 * An action on a photo's thumbnail. Its tooltip carries the same name as the
 * button it wraps, and the button is the later of the two.
 */
export const thumbAction = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true }).last();

/**
 * A step of the trail back up the catalog. Scoped, because the header carries
 * a link called `Regions` of its own.
 */
export const breadcrumb = (page: Page, name: string) =>
  page
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name });

export const card = (page: Page, name: string) =>
  page.getByRole('button', { name: new RegExp(name) });
