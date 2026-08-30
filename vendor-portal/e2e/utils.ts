import { Page } from '@playwright/test';

export type UserRole = 'SuperAdmin' | 'ShopAdmin' | 'ShopUser';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  storeName?: string;
  mobile?: string;
  alternateMobile?: string;
  gstNumber?: string;
  buildingNumber?: string;
  streetName?: string;
  district?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  role: UserRole;
  canAccessBilling?: boolean;
}

export const shopAdminVendor: Vendor = {
  id: '101',
  name: 'Priya Sharma',
  email: 'priya@shop.example',
  storeName: 'Priya Mart',
  mobile: '9876543210',
  alternateMobile: '9876500000',
  gstNumber: '29AAAAA0000A1Z5',
  buildingNumber: '221B',
  streetName: 'Baker Street',
  district: 'Bengaluru Urban',
  state: 'Karnataka',
  country: 'India',
  latitude: 12.9716,
  longitude: 77.5946,
  role: 'ShopAdmin',
  canAccessBilling: true,
};

export const shopUserVendor: Vendor = {
  id: '102',
  name: 'Arjun Rao',
  email: 'arjun@shop.example',
  storeName: 'Priya Mart',
  role: 'ShopUser',
  canAccessBilling: false,
};

export const shopUserWithBillingVendor: Vendor = {
  ...shopUserVendor,
  id: '103',
  canAccessBilling: true,
};

export const superAdminVendor: Vendor = {
  id: '1',
  name: 'Super Admin',
  email: 'admin@marketplace.example',
  role: 'SuperAdmin',
};

/**
 * Navigates and waits for the network to go quiet, giving Angular's client hydration time to
 * finish wiring up event bindings before a test interacts with the page. Under parallel test load,
 * clicking a submit button before hydration attaches (ngSubmit) lets the browser fall back to a
 * native form submission (a full page reload), which is a source of flaky failures — see
 * forgot-password.spec.ts and guards.spec.ts for the symptom this avoids.
 */
export async function gotoReady(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

const SESSION_STORAGE_KEY = 'vendor-portal.session';

export async function seedSession(page: Page, vendor: Vendor, token = 'test-jwt-token'): Promise<void> {
  await page.addInitScript(
    (init: { key: string; session: { token: string; vendor: Vendor } }) => {
      window.localStorage.setItem(init.key, JSON.stringify(init.session));
    },
    { key: SESSION_STORAGE_KEY, session: { token, vendor } },
  );
}

export interface ApiStub {
  pattern: RegExp;
  data?: unknown;
  status?: number;
  errors?: string[];
}

const DEFAULT_DASHBOARD_SUMMARY = {
  totalClients: 0,
  activeListings: 0,
  lowStockListings: 0,
  outOfStockListings: 0,
  netRevenue: 0,
  ordersToday: 0,
  ordersThisWeek: 0,
  fulfillmentRate: 0,
  averageOrderValue: 0,
  netRevenueWeekOverWeekChange: 0,
  revenueTrend: [],
  mostActiveClients: [],
  bestSellers: [],
};

/**
 * Stubs every backend call the app can make (baseUrl https://localhost:55142) so tests never hit a
 * real ASP.NET backend. Unmatched requests get a benign `{ success: true, data: null }` response,
 * except dashboard-summary which always gets a well-formed object — the dashboard component does not
 * null-check `response.data` before reading its fields.
 */
export async function stubApi(page: Page, stubs: ApiStub[] = []): Promise<void> {
  await page.route('https://localhost:55142/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const match = stubs.find((stub) => stub.pattern.test(path));

    if (match) {
      await route.fulfill({
        status: match.status ?? 200,
        json: { success: (match.status ?? 200) < 400, data: match.data ?? null, errors: match.errors },
      });
      return;
    }

    if (path.endsWith('/dashboard-summary')) {
      await route.fulfill({ json: { success: true, data: DEFAULT_DASHBOARD_SUMMARY } });
      return;
    }

    await route.fulfill({ json: { success: true, data: null } });
  });
}
