import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OfflineBillingQueueService } from '../shared/services/offline-billing/offline-billing-queue.service';
import { ProBillingService } from './pro-billing.service';

describe('ProBillingService', () => {
  let service: ProBillingService;
  let httpMock: HttpTestingController;
  const offlineQueueMock = {
    enqueue: vi.fn(async () => ({
      localId: 'local-1',
      idempotencyKey: 'idem-1',
      kind: 'pro' as const,
      payload: {},
      createdAt: '2026-08-30T00:00:00.000Z',
      status: 'pending' as const,
      attempts: 0,
    })),
  };

  beforeEach(() => {
    offlineQueueMock.enqueue.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OfflineBillingQueueService, useValue: offlineQueueMock },
      ],
    });
    service = TestBed.inject(ProBillingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns an empty list without calling the API when the query is too short', async () => {
    const result = await service.searchCustomers('a');

    expect(result).toEqual([]);
    httpMock.expectNone('https://localhost:55142/api/vendor/customers/search?q=a');
  });

  it('searches customers and returns matches', async () => {
    const searchPromise = service.searchCustomers(' jane ');

    const req = httpMock.expectOne((r) => r.url === 'https://localhost:55142/api/vendor/customers/search');
    expect(req.request.params.get('q')).toBe('jane');
    req.flush({
      success: true,
      data: [{ id: 1, name: 'Jane Doe', mobile: '9999999999', email: 'jane@example.com' }],
    });

    const result = await searchPromise;

    expect(result).toEqual([{ id: 1, name: 'Jane Doe', mobile: '9999999999', email: 'jane@example.com' }]);
  });

  it('returns an empty array when the customer search request fails', async () => {
    const searchPromise = service.searchCustomers('jane');

    const req = httpMock.expectOne((r) => r.url === 'https://localhost:55142/api/vendor/customers/search');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    const result = await searchPromise;

    expect(result).toEqual([]);
  });

  it('checks out successfully', async () => {
    const payload = {
      clientName: 'Jane Doe',
      paymentMethod: 'Cash' as const,
      items: [{ productId: 1, quantity: 2 }],
    };

    const checkoutPromise = service.checkout(payload);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      success: true,
      data: {
        orderId: 55,
        clientName: 'Jane Doe',
        totalAmount: 20,
        taxAmount: 2,
        grandTotal: 22,
        amountReceived: 22,
        balanceReturned: 0,
        itemCount: 1,
        createdAt: '2026-08-30T00:00:00.000Z',
      },
    });

    const result = await checkoutPromise;

    expect(result.orderId).toBe(55);
    expect(result.grandTotal).toBe(22);
  });

  it('throws the backend error message when checkout returns no data', async () => {
    const payload = { clientName: 'Jane Doe', paymentMethod: 'Cash' as const, items: [] };

    const checkoutPromise = service.checkout(payload);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.flush({ success: false, data: null, errors: ['Cart is empty'] });

    await expect(checkoutPromise).rejects.toThrow('Cart is empty');
  });

  it('queues the bill offline when the network is unreachable', async () => {
    const payload = {
      clientName: 'Jane Doe',
      paymentMethod: 'UPI' as const,
      amountReceived: 50,
      items: [{ productId: 1, quantity: 1 }],
    };

    const checkoutPromise = service.checkout(payload);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    const result = await checkoutPromise;

    expect(offlineQueueMock.enqueue).toHaveBeenCalledWith('pro', payload);
    expect(result.isOfflinePending).toBe(true);
    expect(result.amountReceived).toBe(50);
    expect(result.itemCount).toBe(1);
  });

  it('throws a generic error message for unexpected server errors', async () => {
    const payload = { clientName: 'Jane Doe', paymentMethod: 'Cash' as const, items: [] };

    const checkoutPromise = service.checkout(payload);

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    await expect(checkoutPromise).rejects.toThrow();
  });
});
