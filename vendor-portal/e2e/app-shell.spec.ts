import { expect, test } from '@playwright/test';

import { gotoReady, seedSession, shopAdminVendor, stubApi } from './utils';

test.describe('App shell', () => {
  test('collapses and expands the sidebar', async ({ page }) => {
    await stubApi(page);
    await seedSession(page, shopAdminVendor);
    await gotoReady(page, '/dashboard');

    const shell = page.locator('section.app-shell');
    await expect(shell).not.toHaveClass(/app-shell--collapsed/);

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(shell).toHaveClass(/app-shell--collapsed/);

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(shell).not.toHaveClass(/app-shell--collapsed/);
  });

  test('expands the settings section for a ShopAdmin', async ({ page }) => {
    await stubApi(page);
    await seedSession(page, shopAdminVendor);
    await gotoReady(page, '/dashboard');

    await expect(page.getByRole('link', { name: 'View details' })).not.toBeVisible();

    await page.getByRole('button', { name: 'Settings' }).click();

    await expect(page.getByRole('link', { name: 'View details' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
  });

  test('shows a confirmation modal and logs out, clearing the session', async ({ page }) => {
    await stubApi(page);
    await seedSession(page, shopAdminVendor);
    await gotoReady(page, '/dashboard');

    const navLogoutButton = page.locator('.sidebar-nav').getByRole('button', { name: 'Log out' });
    const modal = page.locator('.logout-modal-card');

    await navLogoutButton.click();
    await expect(page.getByRole('heading', { name: 'Log out?' })).toBeVisible();

    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Log out?' })).not.toBeVisible();

    await navLogoutButton.click();
    await modal.getByRole('button', { name: 'Log out' }).click();

    await expect(page).toHaveURL(/\/login$/);
    const session = await page.evaluate(() => window.localStorage.getItem('vendor-portal.session'));
    expect(session).toBeNull();
  });
});
