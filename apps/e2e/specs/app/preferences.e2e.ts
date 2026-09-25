import { expect, test } from '@playwright/test';

/**
 * The two choices every reader makes about the app itself. Both are kept in
 * the browser, so both have to survive a reload — and the language is what the
 * rest of the suite pins to English to be able to read anything at all.
 */
test.describe.configure({ mode: 'serial' });

test('the app speaks the language it is told to', async ({ page }) => {
  await page.goto('/profile');

  await test.step('it starts in English', async () => {
    await expect(page.getByRole('link', { name: 'Regions' })).toBeVisible();
  });

  await test.step('switching moves the chrome over', async () => {
    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Українська' }).click();

    await expect(page.getByRole('link', { name: 'Регіони' })).toBeVisible();
  });

  await test.step('and it is still Ukrainian after a reload', async () => {
    await page.reload();
    await expect(page.getByRole('link', { name: 'Регіони' })).toBeVisible();
  });

  await test.step('switching back leaves it in English', async () => {
    await page.getByRole('combobox', { name: 'Мова' }).click();
    await page.getByRole('option', { name: 'English' }).click();

    await expect(page.getByRole('link', { name: 'Regions' })).toBeVisible();
  });
});

test('the theme is remembered', async ({ page }) => {
  await page.goto('/profile');

  const dark = page.getByRole('button', { name: 'Dark' });
  const light = page.getByRole('button', { name: 'Light' });

  await test.step('picking dark presses it', async () => {
    await dark.click();
    await expect(dark).toHaveAttribute('aria-pressed', 'true');
  });

  await test.step('and a reload finds it still pressed', async () => {
    await page.reload();
    await expect(page.getByRole('button', { name: 'Dark' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  await test.step('light takes it back', async () => {
    await light.click();
    await expect(light).toHaveAttribute('aria-pressed', 'true');
  });
});
