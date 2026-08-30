import { expect, test } from '@playwright/test';

import { gotoReady, seedSession, shopAdminVendor, shopUserVendor, stubApi, superAdminVendor } from './utils';

test.describe('Route guards', () => {
  test('redirects unauthenticated access to a protected route to /login with a returnUrl', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
    const url = new URL(page.url());
    expect(url.searchParams.get('returnUrl')).toBe('/dashboard');
  });

  test('redirects a ShopUser away from a ShopAdmin-only route', async ({ page }) => {
    await stubApi(page);
    await seedSession(page, shopUserVendor);

    await page.goto('/products/new');

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  // The app's own '' route unconditionally redirects to /login (it is the first entry in
  // app.routes.ts and matches before the guarded AppShellComponent route), so homeGuard's
  // role-based landing is only ever reachable through the post-login redirect, not by visiting
  // "/" directly — even with a session already in localStorage, "/" still lands on /login.
  test('never lands an authenticated session on "/", even a SuperAdmin one', async ({ page }) => {
    await stubApi(page, [{ pattern: /\/api\/superadmin\/shops$/, data: [] }]);
    await seedSession(page, superAdminVendor);

    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
  });

  test('sends a SuperAdmin straight to the shops list after login (homeGuard\'s intent)', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/auth\/login$/,
        data: { vendorId: 1, name: 'Super Admin', storeName: '', token: 'test-jwt-token', role: 'SuperAdmin' },
      },
      { pattern: /\/api\/superadmin\/shops$/, data: [] },
    ]);

    await gotoReady(page, '/login');
    await page.getByLabel('Email or Login ID').fill('admin@marketplace.example');
    await page.getByLabel('Password').fill('supersecret');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/superadmin\/shops$/);
  });

  test('sends a shop role straight to the dashboard after login', async ({ page }) => {
    await stubApi(page, [
      {
        pattern: /\/api\/auth\/login$/,
        data: { vendorId: 101, name: 'Priya Sharma', storeName: 'Priya Mart', token: 'test-jwt-token', role: 'ShopAdmin' },
      },
    ]);

    await gotoReady(page, '/login');
    await page.getByLabel('Email or Login ID').fill(shopAdminVendor.email);
    await page.getByLabel('Password').fill('supersecret');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
