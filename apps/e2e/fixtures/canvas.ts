import type { Locator, Page } from '@playwright/test';

/**
 * The editor draws on an SVG overlay laid over the photo, in a 0..1 space.
 * Nothing in it carries a role or a name, so a spec points at it the way a
 * person does: a fraction of the photo, turned into a pixel on screen.
 */
const photo = (page: Page, label = 'Photo 1') =>
  page.getByRole('img', { name: label });

/**
 * The same photo is on screen more than once — the stage and its thumbnail in
 * the rail carry the same label — and only the stage can be drawn on. It is
 * the big one.
 */
const stageBox = async (page: Page, label?: string) => {
  // `all()` does not wait for anything, and the editor renders the stage only
  // once the photo has loaded.
  await photo(page, label).first().waitFor();

  const boxes = await Promise.all(
    (await photo(page, label).all()).map((image) => image.boundingBox())
  );
  const stage = boxes
    .filter((box) => box !== null)
    .sort((a, b) => b.width * b.height - a.width * a.height)
    .at(0);

  if (!stage) throw new Error('The photo is not on screen');

  return stage;
};

const toScreen = async (page: Page, x: number, y: number, label?: string) => {
  const box = await stageBox(page, label);

  return { x: box.x + box.width * x, y: box.y + box.height * y };
};

/** One point of a line, at a fraction of the photo. */
export const clickPhoto = async (
  page: Page,
  x: number,
  y: number,
  label?: string
) => {
  const at = await toScreen(page, x, y, label);

  await page.mouse.click(at.x, at.y);
};

/** Drag whatever sits under the first point onto the second. */
export const dragOnPhoto = async (
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
  label?: string
) => {
  const start = await toScreen(page, from.x, from.y, label);
  const end = await toScreen(page, to.x, to.y, label);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  // Two moves: the editor treats a pointer that barely travelled as a click.
  await page.mouse.move((start.x + end.x) / 2, (start.y + end.y) / 2);
  await page.mouse.move(end.x, end.y);
  await page.mouse.up();
};

/**
 * Drag a point of a line onto another spot of the photo. Points are marked
 * with `HANDLE_CLASS` from the editor, which exists precisely so a handle can
 * be told from the line under it.
 */
export const dragHandleTo = async (
  page: Page,
  handle: Locator,
  to: { x: number; y: number },
  label?: string
) => {
  const from = await handle.boundingBox();

  if (!from) throw new Error('The point is not on screen');

  const end = await toScreen(page, to.x, to.y, label);

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move((from.x + end.x) / 2, (from.y + end.y) / 2);
  await page.mouse.move(end.x, end.y);
  await page.mouse.up();
};

export const handles = (page: Page) => page.locator('.topoEditHandle');

export const photoOnStage = photo;
