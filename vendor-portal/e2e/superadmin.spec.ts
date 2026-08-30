import { expect, test } from '@playwright/test';

import { gotoReady, seedSession, stubApi, superAdminVendor } from './utils';

test.describe('Superadmin', () => {
  test('renders the all-shops list', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/superadmin\/shops$/,
        data: [
          {
            vendorId: 55,
            name: 'Lena Fox',
            storeName: 'Fox & Co',
            email: 'lena@foxco.example',
            isApproved: true,
            createdAt: '2026-07-01T00:00:00Z',
          },
        ],
      },
    ]);
    await seedSession(page, superAdminVendor);

    await gotoReady(page, '/superadmin/shops');

    await expect(page.getByRole('heading', { name: 'All shops' })).toBeVisible();
    await expect(page.getByText('Fox & Co')).toBeVisible();
  });

  test('navigates into a shop detail report', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/superadmin\/shops$/,
        data: [
          {
            vendorId: 55,
            name: 'Lena Fox',
            storeName: 'Fox & Co',
            email: 'lena@foxco.example',
            isApproved: true,
            createdAt: '2026-07-01T00:00:00Z',
          },
        ],
      },
      {
        pattern: /\/api\/superadmin\/shops\/55$/,
        data: {
          totalClients: 8,
          activeListings: 15,
          lowStockListings: 1,
          outOfStockListings: 0,
          netRevenue: 42000,
          ordersToday: 2,
          ordersThisWeek: 9,
          fulfillmentRate: 95,
          averageOrderValue: 700,
        },
      },
    ]);
    await seedSession(page, superAdminVendor);

    await gotoReady(page, '/superadmin/shops');
    await page.getByRole('link', { name: 'View details' }).click();

    await expect(page).toHaveURL(/\/superadmin\/shops\/55$/);
    await expect(page.getByRole('heading', { name: 'Shop report' })).toBeVisible();
    await expect(page.locator('article.stat-card', { hasText: 'Total clients' })).toContainText('8');
  });
});
