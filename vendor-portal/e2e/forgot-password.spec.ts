import { expect, test } from '@playwright/test';

import { gotoReady } from './utils';

test.describe('Forgot password page', () => {
  test('renders the reset request form', async ({ page }) => {
    await gotoReady(page, '/forgot-password');

    await expect(page.getByRole('heading', { name: 'Forgot your password?' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible();
  });

  test('submits a reset request and shows a confirmation message', async ({ page }) => {
    await gotoReady(page, '/forgot-password');

    await page.getByLabel('Email address').fill('vendor@example.com');
    await page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(page.getByText("If that email exists, we've sent a reset link.")).toBeVisible();
  });

  test('navigates back to login', async ({ page }) => {
    await gotoReady(page, '/forgot-password');

    await page.getByRole('link', { name: 'Back to login' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
