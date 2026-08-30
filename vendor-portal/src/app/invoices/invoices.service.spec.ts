import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InvoicesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads all invoices into the signal', async () => {
    const loadPromise = service.loadAll();

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/invoices');
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [
        {
          orderId: 1,
          clientName: 'Jane Doe',
          customerMobile: null,
          paymentMethod: 'Cash',
          itemCount: 2,
          totalAmount: 100,
          taxAmount: 10,
          grandTotal: 110,
          status: 'Completed',
          wasCreatedOffline: false,
          createdAt: '2026-08-30T00:00:00.000Z',
        },
      ],
    });

    await loadPromise;

    expect(service.invoices()).toHaveLength(1);
    expect(service.invoices()[0].clientName).toBe('Jane Doe');
  });

  it('sets an empty list when loading invoices fails', async () => {
    const loadPromise = service.loadAll();

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/invoices');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    await loadPromise;

    expect(service.invoices()).toEqual([]);
  });

  it('gets an invoice by id', async () => {
    const getPromise = service.getById(1);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/invoices/1');
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        orderId: 1,
        clientName: 'Jane Doe',
        customerMobile: null,
        customerEmail: null,
        paymentMethod: 'Cash',
        status: 'Completed',
        totalAmount: 100,
        taxAmount: 10,
        grandTotal: 110,
        amountReceived: 110,
        balanceReturned: 0,
        wasCreatedOffline: false,
        createdAt: '2026-08-30T00:00:00.000Z',
        items: [],
      },
    });

    const result = await getPromise;

    expect(result?.orderId).toBe(1);
  });

  it('returns null when getById fails', async () => {
    const getPromise = service.getById(404);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/invoices/404');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });

    const result = await getPromise;

    expect(result).toBeNull();
  });

  it('returns an order and updates its status locally', async () => {
    const loadPromise = service.loadAll();
    httpMock.expectOne('https://localhost:55142/api/vendor/invoices').flush({
      success: true,
      data: [
        {
          orderId: 1,
          clientName: 'Jane Doe',
          customerMobile: null,
          paymentMethod: 'Cash',
          itemCount: 1,
          totalAmount: 100,
          taxAmount: 10,
          grandTotal: 110,
          status: 'Completed',
          wasCreatedOffline: false,
          createdAt: '2026-08-30T00:00:00.000Z',
        },
      ],
    });
    await loadPromise;

    const returnPromise = service.returnOrder(1);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders/1/return');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { orderId: 1, status: 'Returned' } });

    await returnPromise;

    expect(service.invoices()[0].status).toBe('Returned');
  });

  it('throws the backend error message when returning an order fails', async () => {
    const returnPromise = service.returnOrder(1);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders/1/return');
    req.flush({ success: false, data: null, errors: ['Return window has expired'] });

    await expect(returnPromise).rejects.toThrow('Return window has expired');
  });

  it('throws a generic error message for unexpected server errors on return', async () => {
    const returnPromise = service.returnOrder(1);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders/1/return');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    await expect(returnPromise).rejects.toThrow();
  });
});
