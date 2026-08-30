import { expect, test } from '@playwright/test';

test.describe('Login page', () => {
  test('redirects the root path to /login', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('shows a validation error when submitting without credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid email/login ID or password')).toBeVisible();
  });

  test('navigates to the signup page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: 'Sign up' }).click();

    await expect(page).toHaveURL(/\/signup$/);
  });

  test('navigates to the forgot-password page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: 'Forgot password?' }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
  });
});
