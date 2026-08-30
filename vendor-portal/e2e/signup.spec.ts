import { expect, test } from '@playwright/test';

import { gotoReady } from './utils';

test.describe('Signup page', () => {
  test('renders the registration form on the first step', async ({ page }) => {
    await gotoReady(page, '/signup');

    await expect(page.getByRole('heading', { name: 'Register as a vendor' })).toBeVisible();
    const stepper = page.locator('.stepper[aria-label="Signup steps"]');
    await expect(stepper.getByText('Account', { exact: true })).toBeVisible();
    await expect(stepper.getByText('Store details', { exact: true })).toBeVisible();
    await expect(stepper.getByText('Address & location', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Full name')).toBeVisible();
  });

  test('disables the Next button until step-one fields are valid', async ({ page }) => {
    await gotoReady(page, '/signup');

    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('shows a validation error for an invalid email', async ({ page }) => {
    await gotoReady(page, '/signup');

    const emailInput = page.getByLabel('Email');
    await emailInput.fill('not-an-email');
    await emailInput.blur();

    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  });

  test('advances to the store-details step once step one is valid', async ({ page }) => {
    await gotoReady(page, '/signup');

    await page.getByLabel('Full name').fill('Jordan Vendor');
    await page.getByLabel('Email').fill('jordan@example.com');
    await page.getByLabel('Mobile number', { exact: true }).fill('9123456780');
    await page.getByLabel('Password', { exact: true }).fill('supersecret');
    await page.getByLabel('Confirm password').fill('supersecret');

    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByLabel('Store name')).toBeVisible();
  });

  test('navigates back to login', async ({ page }) => {
    await gotoReady(page, '/signup');

    await page.getByRole('link', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
