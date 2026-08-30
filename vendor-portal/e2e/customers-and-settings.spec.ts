import { expect, test } from '@playwright/test';

import { gotoReady, seedSession, shopAdminVendor, stubApi } from './utils';

test.describe('Customers and settings screens', () => {
  test('renders the customers list', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/vendor\/customers$/,
        data: [{ id: 1, name: 'Meera Iyer', mobile: '9988776655', email: 'meera@example.com' }],
      },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/customers');

    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
    await expect(page.getByText('Meera Iyer')).toBeVisible();
  });

  test('renders the vendor details page from the session', async ({ page }) => {
    await stubApi(page);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/settings/vendor-details');

    await expect(page.getByRole('heading', { name: 'Vendor details' })).toBeVisible();
    await expect(page.getByText(shopAdminVendor.storeName as string).first()).toBeVisible();
    await expect(page.getByText(shopAdminVendor.gstNumber as string)).toBeVisible();
  });

  test('renders the billed invoices list', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/vendor\/invoices$/,
        data: [
          {
            orderId: 501,
            clientName: 'Neel Traders',
            customerMobile: '9000011111',
            paymentMethod: 'Cash',
            itemCount: 3,
            totalAmount: 1000,
            taxAmount: 50,
            grandTotal: 1050,
            status: 'Completed',
            wasCreatedOffline: false,
            createdAt: '2026-08-20T10:00:00Z',
          },
        ],
      },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/settings/invoices');

    await expect(page.getByRole('heading', { name: 'Billed invoices' })).toBeVisible();
    await expect(page.getByText('Neel Traders')).toBeVisible();
  });

  test('renders the sales report for the default day range', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/vendor\/sales-report$/,
        data: {
          startDate: '2026-08-30',
          endDate: '2026-08-30',
          totalSales: 5000,
          totalOrders: 4,
          returnedAmount: 0,
          returnedOrders: 0,
          paymentMethodBreakdown: [{ paymentMethod: 'Cash', amount: 5000, orderCount: 4 }],
          lines: [],
        },
      },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/settings/sales-report');

    await expect(page.getByRole('heading', { name: 'Sales report' })).toBeVisible();
    await expect(page.locator('.stat-card.highlight')).toContainText('₹5000.00');
  });

  test('renders the shop users list', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/vendor\/shop-users$/,
        data: [
          {
            id: 1,
            name: 'Kabir Singh',
            loginId: 'kabir.singh',
            email: null,
            canAccessBilling: true,
            isActive: true,
            createdAt: '2026-08-01T00:00:00Z',
          },
        ],
      },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/settings/users');

    await expect(page.getByRole('heading', { name: 'Shop users' })).toBeVisible();
    await expect(page.getByText('Kabir Singh')).toBeVisible();
  });
});
