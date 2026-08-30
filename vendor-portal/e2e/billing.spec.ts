import { expect, test } from '@playwright/test';

import { gotoReady, seedSession, shopAdminVendor, shopUserVendor, stubApi } from './utils';

test.describe('Billing', () => {
  test('loads the billing workspace for a vendor with billing access', async ({ page }) => {
    await stubApi(page, [
      { pattern: /\/api\/vendor\/products$/, data: [] },
      { pattern: /\/api\/categories$/, data: [] },
      { pattern: /\/api\/vendor\/settings$/, data: { useProBilling: false } },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/billing');

    await expect(page.locator('.page-header h1')).toHaveText('Billing');
    await expect(page.getByText('Online')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pro mode' })).toBeVisible();
  });

  test('toggles into pro billing mode', async ({ page }) => {
    await stubApi(page, [
      { pattern: /\/api\/vendor\/products$/, data: [] },
      { pattern: /\/api\/categories$/, data: [] },
      { pattern: /\/api\/vendor\/settings$/, data: { useProBilling: false } },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/billing');
    await page.getByRole('button', { name: 'Pro mode' }).click();

    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('redirects a ShopUser without billing access away from /billing', async ({ page }) => {
    await stubApi(page);
    await seedSession(page, shopUserVendor);

    await gotoReady(page, '/billing');

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
