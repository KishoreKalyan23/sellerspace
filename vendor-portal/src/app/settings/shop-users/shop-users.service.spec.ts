import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ShopUsersService } from './shop-users.service';

describe('ShopUsersService', () => {
  const baseUrl = 'https://localhost:55142';
  let service: ShopUsersService;
  let httpMock: HttpTestingController;

  const shopUser = {
    id: 1,
    name: 'Alex',
    loginId: 'alex',
    email: 'alex@example.com',
    canAccessBilling: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShopUsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts with an empty shopUsers signal', () => {
    expect(service.shopUsers()).toEqual([]);
  });

  it('loadAll() populates the shopUsers signal', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/shop-users`);
    req.flush({ success: true, data: [shopUser] });
    await loadPromise;

    expect(service.shopUsers()).toEqual([shopUser]);
  });

  it('loadAll() resets the signal to empty when the request fails', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/shop-users`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });
    await loadPromise;

    expect(service.shopUsers()).toEqual([]);
  });

  it('create() posts the payload and prepends the new user', async () => {
    const createPromise = service.create({
      name: 'Alex',
      loginId: 'alex',
      email: 'alex@example.com',
      password: 'secret',
      canAccessBilling: true,
    });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/shop-users`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: shopUser });

    const result = await createPromise;

    expect(result).toEqual(shopUser);
    expect(service.shopUsers()[0]).toEqual(shopUser);
  });

  it('create() throws the backend error message when no data is returned', async () => {
    const createPromise = service.create({
      name: 'Alex',
      loginId: 'alex',
      password: 'secret',
      canAccessBilling: false,
    });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/shop-users`);
    req.flush({ success: false, data: null, errors: ['Login id already exists'] });

    await expect(createPromise).rejects.toThrow('Login id already exists');
  });

  it('update() puts the payload and replaces the matching user', async () => {
    const updated = { ...shopUser, name: 'Alexandra', canAccessBilling: false };
    const updatePromise = service.update(1, { name: 'Alexandra', canAccessBilling: false, isActive: true });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/shop-users/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: updated });

    const result = await updatePromise;

    expect(result).toEqual(updated);
  });

  it('update() throws the backend error message when no data is returned', async () => {
    const updatePromise = service.update(1, { name: 'Alexandra', canAccessBilling: false, isActive: true });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/shop-users/1`);
    req.flush({ success: false, data: null, errors: ['User not found'] });

    await expect(updatePromise).rejects.toThrow('User not found');
  });

  it('resetPassword() puts the new password', async () => {
    const resetPromise = service.resetPassword(1, 'newSecret');
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/shop-users/1/reset-password`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ newPassword: 'newSecret' });
    req.flush({ success: true, data: {} });

    await expect(resetPromise).resolves.toBeUndefined();
  });

  it('resetPassword() throws the backend error message on failure', async () => {
    const resetPromise = service.resetPassword(1, 'weak');
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/shop-users/1/reset-password`);
    req.flush({ success: false, errors: ['Password too weak'] }, { status: 400, statusText: 'Bad Request' });

    await expect(resetPromise).rejects.toThrow('Password too weak');
  });
});
