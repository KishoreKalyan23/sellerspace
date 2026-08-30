import { expect, test } from '@playwright/test';

import { gotoReady, seedSession, shopAdminVendor, stubApi } from './utils';

test.describe('Products', () => {
  test('renders the product list from stubbed data', async ({ page }) => {
    // Uses a product name that doesn't collide with ProductsService's built-in fallback catalog,
    // so the assertion only passes once the client has fetched and applied this stub (not the
    // transient server-rendered fallback state used while the real backend is unreachable).
    await stubApi(page, [
      {
        pattern: /\/api\/vendor\/products$/,
        data: [
          {
            id: 501,
            vendorId: 1,
            categoryId: 1,
            name: 'Zenith Standing Desk',
            price: 8999,
            taxPercent: 5,
            stock: 32,
            isActive: true,
            categoryName: 'Office',
          },
        ],
      },
      { pattern: /\/api\/categories$/, data: [{ id: 1, name: 'Office', parentCategoryId: null, children: [] }] },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/products');

    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Zenith Standing Desk' })).toBeVisible();
  });

  test('opens and closes the add-product modal', async ({ page }) => {
    await stubApi(page, [{ pattern: /\/api\/vendor\/products$/, data: [] }, { pattern: /\/api\/categories$/, data: [] }]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/products');
    await page.getByRole('button', { name: 'Add product' }).click();

    await expect(page.getByRole('heading', { name: 'Add product details' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('heading', { name: 'Add product details' })).not.toBeVisible();
  });

  test('navigates to the edit-product page for an existing product', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/vendor\/products$/,
        data: [
          {
            id: 7,
            vendorId: 1,
            categoryId: 1,
            name: 'Nimbus Trail Backpack',
            price: 3299,
            taxPercent: 0,
            stock: 22,
            isActive: true,
            categoryName: 'Outdoor',
          },
        ],
      },
      { pattern: /\/api\/categories$/, data: [{ id: 1, name: 'Outdoor', parentCategoryId: null, children: [] }] },
    ]);
    await seedSession(page, shopAdminVendor);

    await gotoReady(page, '/products');

    // Wait for the stubbed product itself (not just any card) so this doesn't race the
    // server-rendered fallback catalog that briefly appears before the client refetches.
    const card = page.locator('.product-card', { hasText: 'Nimbus Trail Backpack' });
    await expect(card).toBeVisible();
    await card.getByRole('link', { name: 'Edit' }).click();

    await expect(page).toHaveURL(/\/products\/7\/edit$/);
    await expect(page.getByRole('heading', { name: 'Edit product' })).toBeVisible();
    await expect(page.getByLabel('Product name')).toHaveValue('Nimbus Trail Backpack');
  });

  test('a ShopUser cannot see the add-product action', async ({ page }) => {
    await stubApi(page, [{ pattern: /\/api\/vendor\/products$/, data: [] }, { pattern: /\/api\/categories$/, data: [] }]);
    await seedSession(page, { ...shopAdminVendor, id: '999', role: 'ShopUser' });

    await gotoReady(page, '/products');

    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add product' })).toHaveCount(0);
  });
});
