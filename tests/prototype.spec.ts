import { expect, test } from '@playwright/test';

test('renders playable prototype HUD and canvas', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('game-canvas')).toBeVisible();
  await expect(page.getByLabel('Delivery status')).toContainText('Time');
  await expect(page.getByText('W/S drive · A/D steer · R restart')).toBeVisible();
});

test('keyboard input changes speed readout', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.down('w');
  await page.waitForTimeout(900);
  await page.keyboard.up('w');

  await expect(page.getByLabel('Delivery status')).not.toContainText('0 km/h');
});
