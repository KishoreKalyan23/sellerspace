import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SuperAdminService } from './superadmin.service';

describe('SuperAdminService', () => {
  const baseUrl = 'https://localhost:55142';
  let service: SuperAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SuperAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts with an empty shops signal', () => {
    expect(service.shops()).toEqual([]);
  });

  it('getSetupStatus() returns true when setup is complete', async () => {
    const statusPromise = service.getSetupStatus();
    const req = httpMock.expectOne(`${baseUrl}/api/superadmin/setup/status`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { isSetupComplete: true } });

    await expect(statusPromise).resolves.toBe(true);
  });

  it('getSetupStatus() rejects when the request fails', async () => {
    const statusPromise = service.getSetupStatus();
    const req = httpMock.expectOne(`${baseUrl}/api/superadmin/setup/status`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });

    await expect(statusPromise).rejects.toBeTruthy();
  });

  it('setup() posts the payload and returns the auth result', async () => {
    const setupPromise = service.setup({ name: 'Admin', email: 'admin@example.com', password: 'secret' });
    const req = httpMock.expectOne(`${baseUrl}/api/superadmin/setup`);
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      data: { vendorId: 1, name: 'Admin', role: 'SuperAdmin', token: 'jwt-token' },
    });

    await expect(setupPromise).resolves.toEqual({
      vendorId: 1,
      name: 'Admin',
      role: 'SuperAdmin',
      token: 'jwt-token',
    });
  });

  it('setup() throws the backend error message when no data is returned', async () => {
    const setupPromise = service.setup({ name: 'Admin', email: 'admin@example.com', password: 'secret' });
    const req = httpMock.expectOne(`${baseUrl}/api/superadmin/setup`);
    req.flush({ success: false, data: null, errors: ['Setup already completed'] });

    await expect(setupPromise).rejects.toThrow('Setup already completed');
  });

  it('loadShops() populates the shops signal', async () => {
    const shop = {
      vendorId: 1,
      name: 'Vendor One',
      storeName: 'Store One',
      email: 'vendor@example.com',
      isApproved: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const loadPromise = service.loadShops();
    const req = httpMock.expectOne(`${baseUrl}/api/superadmin/shops`);
    req.flush({ success: true, data: [shop] });
    await loadPromise;

    expect(service.shops()).toEqual([shop]);
  });

  it('loadShops() resets the signal to empty when the request fails', async () => {
    const loadPromise = service.loadShops();
    const req = httpMock.expectOne(`${baseUrl}/api/superadmin/shops`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });
    await loadPromise;

    expect(service.shops()).toEqual([]);
  });

  it('getShopDetail() returns the dashboard summary', async () => {
    const summary = {
      totalClients: 10,
      activeListings: 5,
      lowStockListings: 1,
      outOfStockListings: 0,
      netRevenue: 5000,
      ordersToday: 2,
      ordersThisWeek: 8,
      fulfillmentRate: 0.9,
      averageOrderValue: 500,
    };

    const detailPromise = service.getShopDetail(1);
    const req = httpMock.expectOne(`${baseUrl}/api/superadmin/shops/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: summary });

    await expect(detailPromise).resolves.toEqual(summary);
  });

  it('getShopDetail() returns null when the request fails', async () => {
    const detailPromise = service.getShopDetail(999);
    const req = httpMock.expectOne(`${baseUrl}/api/superadmin/shops/999`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });

    await expect(detailPromise).resolves.toBeNull();
  });
});
