import { expect, test } from '@playwright/test';

import { gotoReady, seedSession, shopAdminVendor, stubApi } from './utils';

test.describe('Dashboard', () => {
  test('loads and renders the vendor dashboard summary', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/vendor\/dashboard-summary$/,
        data: {
          totalClients: 12,
          activeListings: 34,
          lowStockListings: 2,
          outOfStockListings: 1,
          netRevenue: 125000,
          ordersToday: 5,
          ordersThisWeek: 20,
          fulfillmentRate: 92,
          averageOrderValue: 850,
          netRevenueWeekOverWeekChange: 8,
          revenueTrend: [10, 20, 30, 40],
          mostActiveClients: [{ name: 'Acme Traders', orderCount: 9, lastOrderDate: '20 Aug 2026' }],
          bestSellers: [{ name: 'Aurora Desk Lamp', units: 40, revenue: 60000, revenueSharePercent: 35 }],
        },
      },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/dashboard');

    await expect(page.getByRole('heading', { name: 'Vendor dashboard' })).toBeVisible();
    await expect(page.getByText('Acme Traders')).toBeVisible();
    await expect(page.getByText('Aurora Desk Lamp')).toBeVisible();
    await expect(page.locator('.stat-card', { hasText: 'Total clients billed' })).toContainText('12');
  });

  test('shows an error state when the summary request fails', async ({ page }) => {
    await stubApi(page, [{ pattern: /\/api\/vendor\/dashboard-summary$/, status: 500, errors: ['Server error'] }]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/dashboard');

    await expect(page.getByText('Unable to load dashboard data. Please try again later.')).toBeVisible();
  });
});
