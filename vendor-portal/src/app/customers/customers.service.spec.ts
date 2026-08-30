import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  const baseUrl = 'https://localhost:55142';
  let service: CustomersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts with an empty customers signal', () => {
    expect(service.customers()).toEqual([]);
  });

  it('loadAll() populates the customers signal', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/customers`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [{ id: 1, name: 'Jane', mobile: '9999999999', email: 'jane@example.com' }],
    });
    await loadPromise;

    expect(service.customers()).toEqual([{ id: 1, name: 'Jane', mobile: '9999999999', email: 'jane@example.com' }]);
  });

  it('loadAll() resets the signal to empty when the request fails', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/customers`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });
    await loadPromise;

    expect(service.customers()).toEqual([]);
  });

  it('create() posts the payload and prepends the new customer', async () => {
    const createPromise = service.create({ name: 'Jane', mobile: '9999999999', email: 'jane@example.com' });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/customers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Jane', mobile: '9999999999', email: 'jane@example.com' });
    req.flush({ success: true, data: { id: 2, name: 'Jane', mobile: '9999999999', email: 'jane@example.com' } });

    const result = await createPromise;

    expect(result).toEqual({ id: 2, name: 'Jane', mobile: '9999999999', email: 'jane@example.com' });
    expect(service.customers()[0]).toEqual(result);
  });

  it('create() throws the backend error message when no data is returned', async () => {
    const createPromise = service.create({ name: 'Jane', mobile: '9999999999' });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/customers`);
    req.flush({ success: false, data: null, errors: ['Mobile number already exists'] });

    await expect(createPromise).rejects.toThrow('Mobile number already exists');
  });

  it('create() throws a fallback message when the server errors without a payload', async () => {
    const createPromise = service.create({ name: 'Jane', mobile: '9999999999' });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/customers`);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });

    await expect(createPromise).rejects.toThrow('Could not save customer.');
  });
});
