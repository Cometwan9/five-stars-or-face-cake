import { expect, test } from '@playwright/test';

test('renders playable prototype HUD and canvas', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('game-canvas')).toBeVisible();
  await expect(page.locator('.disaster-layer')).toHaveCount(0);
  await expect(page.locator('.road-ribbon')).toHaveCount(0);
  await expect(page.getByLabel('Delivery status')).toContainText('Time');
  await expect(page.getByText('W/↑ drive · Space boost · A/D dodge · Caps Lock view · R restart')).toBeVisible();
  await expect(page.getByRole('button', { name: /Caps Lock/ })).toBeVisible();
});

test('keyboard input changes speed readout', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('game-canvas')).toBeVisible();
  const speedReadout = page.getByLabel('Speed readout');

  await page.keyboard.down('w');
  try {
    await expect(speedReadout).toHaveText(/^[1-9]\d* km\/h$/);
  } finally {
    await page.keyboard.up('w');
  }
});

test('view mode can switch in the HUD', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Caps Lock/ }).click();
  await expect(page.getByRole('button', { name: /车把视角/ })).toBeVisible();
});
