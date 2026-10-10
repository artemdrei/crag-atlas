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

/**
 * A catalog card. The card is itself one big button, and its menu of actions
 * is a sibling rendered after it whose label repeats the row's name — so the
 * card is the first match.
 */
export const card = (page: Page, name: string) =>
  page.getByRole('button', { name: new RegExp(name) }).first();

/**
 * The ascents on the route page: the right-hand panel on a desktop, the
 * Logbook tab on a phone. An empty list offers its own `Log ascent`, so a
 * button inside it is reached through this region.
 */
export const ascentsPanel = (page: Page) =>
  page.getByRole('region', { name: 'Ascents' });

/**
 * The route page's own log button. Its name changes once the route is sent,
 * and an empty ascents list repeats it, so it is reached by its test id.
 */
export const logTickButton = (page: Page) => page.getByTestId('log-tick');

/**
 * A select is a combobox whose options open in a portal, so the option is
 * picked from the page rather than from inside the field.
 */
export const pickOption = async (page: Page, field: string, option: string) => {
  await page.getByRole('combobox', { name: field }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
};

/**
 * The grades are picked inside the filters, which a phone opens as a sheet
 * and closes again to show the list.
 */
export const pickGrade = async (page: Page, grade: string) => {
  const toggle = page.getByRole('button', { name: /^Filters/ });

  if ((await toggle.getAttribute('aria-expanded')) !== 'true')
    await toggle.click();

  await page.getByRole('button', { name: grade, exact: true }).click();

  const show = page.getByRole('button', { name: /^Show \d+ routes?$/ });

  if (await show.isVisible()) await show.click();
};

/**
 * A filter set away from its default carries a mark on its field, so the
 * climber sees at a glance that the list is not the whole picture.
 */
export const expectFilters = async (
  page: Page,
  values: Record<string, string>
) => {
  for (const [field, value] of Object.entries(values))
    await expect(page.getByRole('combobox', { name: field })).toHaveText(value);
};

export const isFilterActive = (page: Page, field: string) =>
  page
    .locator('[data-active]')
    .filter({ has: page.getByRole('combobox', { name: field }) });

const isoDate = (offset: number) => {
  const day = new Date();

  day.setDate(day.getDate() + offset);

  return day.toISOString().slice(0, 10);
};

/**
 * The browser asks Open-Meteo itself, and a spec must not depend on somebody
 * else's forecast or spend a shared runner's quota. The API answer is stubbed
 * alongside, so this one only has to be well-formed.
 */
export const answerOpenMeteo = (page: Page) =>
  page.route(/open-meteo\.com/, (request) =>
    request.fulfill({ json: { utc_offset_seconds: 0, hourly: { time: [] } } })
  );

/**
 * A sector's conditions as the API would send them, with the given scores
 * one day apart from today. Each day carries one reading, so the header has a
 * temperature to show.
 */
export const conditionsOf = (scores: number[], hasPoint = true) => ({
  hasPoint,
  isHorizonReady: true,
  shelter: 'none',
  aspectDeg: 180,
  days: scores.map((score, offset) => ({
    date: isoDate(offset),
    hasForecast: true,
    score,
    band: null,
    bestFromAt: null,
    bestUntilAt: null,
    sunriseAt: null,
    sunsetAt: null,
    sunIntervals: [],
    hours: [
      {
        at: '12:00',
        score,
        band: null,
        isSun: false,
        temperatureC: 18,
        precipitationMm: 0,
        humidityPct: 50,
        windSpeedMs: 2,
        weatherCode: 1
      }
    ]
  }))
});
