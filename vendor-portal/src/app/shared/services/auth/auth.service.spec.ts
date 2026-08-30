import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('logs in successfully and stores the session', async () => {
    const loginPromise = service.login('vendor@example.com', 'password123');

    const req = httpMock.expectOne('https://localhost:55142/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      success: true,
      data: {
        vendorId: 1,
        name: 'Vendor One',
        storeName: 'Store One',
        token: 'jwt-token',
        role: 'ShopAdmin',
      },
    });

    const result = await loginPromise;

    expect(result).toBe(true);
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentVendor()?.email).toBe('vendor@example.com');
    expect(service.role()).toBe('ShopAdmin');
  });

  it('returns false when the API responds without a token', async () => {
    const loginPromise = service.login('vendor@example.com', 'wrong-password');

    const req = httpMock.expectOne('https://localhost:55142/api/auth/login');
    req.flush({ success: false, data: null, errors: ['Invalid credentials'] });

    const result = await loginPromise;

    expect(result).toBe(false);
    expect(service.isLoggedIn()).toBe(false);
  });

  it('returns false when the request errors', async () => {
    const loginPromise = service.login('vendor@example.com', 'password123');

    const req = httpMock.expectOne('https://localhost:55142/api/auth/login');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    const result = await loginPromise;

    expect(result).toBe(false);
  });

  it('clears the session on logout', async () => {
    const loginPromise = service.login('vendor@example.com', 'password123');
    httpMock.expectOne('https://localhost:55142/api/auth/login').flush({
      success: true,
      data: { vendorId: 1, name: 'Vendor One', storeName: 'Store One', token: 'jwt-token', role: 'ShopAdmin' },
    });
    await loginPromise;

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentVendor()).toBeNull();
    expect(localStorage.getItem('vendor-portal.session')).toBeNull();
  });
});
