import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { UserSettingsService } from './user-settings.service';

describe('UserSettingsService', () => {
  const baseUrl = 'https://localhost:55142';
  let service: UserSettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserSettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getSettings() returns the data from the API', async () => {
    const settingsPromise = service.getSettings();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/settings`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { useProBilling: true } });

    await expect(settingsPromise).resolves.toEqual({ useProBilling: true });
  });

  it('getSettings() defaults to useProBilling false when data is missing', async () => {
    const settingsPromise = service.getSettings();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/settings`);
    req.flush({ success: true, data: null });

    await expect(settingsPromise).resolves.toEqual({ useProBilling: false });
  });

  it('getSettings() defaults to useProBilling false when the request errors', async () => {
    const settingsPromise = service.getSettings();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/settings`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });

    await expect(settingsPromise).resolves.toEqual({ useProBilling: false });
  });

  it('setUseProBilling() sends the flag as a PUT request', async () => {
    const setPromise = service.setUseProBilling(true);
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/settings`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ useProBilling: true });
    req.flush({ success: true, data: { useProBilling: true } });

    await expect(setPromise).resolves.toBeUndefined();
  });

  it('setUseProBilling() rejects when the request fails', async () => {
    const setPromise = service.setUseProBilling(true);
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/settings`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });

    await expect(setPromise).rejects.toBeTruthy();
  });
});
