import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OfflineBillingQueueService } from '../shared/services/offline-billing/offline-billing-queue.service';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;
  let httpMock: HttpTestingController;
  const offlineQueueMock = {
    enqueue: vi.fn(async () => ({
      localId: 'local-1',
      idempotencyKey: 'idem-1',
      kind: 'simple' as const,
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
    service = TestBed.inject(BillingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('adds a new item to the cart', () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 2 });

    expect(service.billingItems()).toEqual([{ productId: 1, name: 'Widget', price: 10, quantity: 2 }]);
  });

  it('merges quantity when adding an item that already exists', () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 2 });
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 3 });

    expect(service.billingItems()).toEqual([{ productId: 1, name: 'Widget', price: 10, quantity: 5 }]);
  });

  it('removes an item by productId', () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 2 });
    service.addItem({ productId: 2, name: 'Gadget', price: 5, quantity: 1 });

    service.removeItem(1);

    expect(service.billingItems()).toEqual([{ productId: 2, name: 'Gadget', price: 5, quantity: 1 }]);
  });

  it('updates quantity and normalizes to at least 1, flooring decimals', () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 2 });

    service.updateQuantity(1, 4.9);
    expect(service.billingItems()[0].quantity).toBe(4);

    service.updateQuantity(1, 0);
    expect(service.billingItems()[0].quantity).toBe(1);

    service.updateQuantity(1, -3);
    expect(service.billingItems()[0].quantity).toBe(1);
  });

  it('computes subtotal and total from cart items', () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 2 });
    service.addItem({ productId: 2, name: 'Gadget', price: 5, quantity: 3 });

    expect(service.subtotal()).toBe(35);
    expect(service.total()).toBe(35);
  });

  it('checks out successfully and clears the cart', async () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 2 });

    const checkoutPromise = service.checkout('Jane Doe', 'Cash');

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      clientName: 'Jane Doe',
      paymentMethod: 'Cash',
      items: [{ productId: 1, quantity: 2 }],
    });
    req.flush({
      success: true,
      data: { orderId: 99, clientName: 'Jane Doe', totalAmount: 20, itemCount: 1, createdAt: '2026-08-30T00:00:00.000Z' },
    });

    const result = await checkoutPromise;

    expect(result.orderId).toBe(99);
    expect(service.billingItems()).toEqual([]);
  });

  it('throws the backend error message when checkout returns no data', async () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 1 });

    const checkoutPromise = service.checkout('Jane Doe', 'Cash');

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.flush({ success: false, data: null, errors: ['Product out of stock'] });

    await expect(checkoutPromise).rejects.toThrow('Product out of stock');
  });

  it('queues the bill offline and clears the cart when the network is unreachable', async () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 2 });

    const checkoutPromise = service.checkout('Jane Doe', 'UPI');

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    const result = await checkoutPromise;

    expect(offlineQueueMock.enqueue).toHaveBeenCalledWith('simple', {
      clientName: 'Jane Doe',
      paymentMethod: 'UPI',
      items: [{ productId: 1, quantity: 2 }],
    });
    expect(result.isOfflinePending).toBe(true);
    expect(result.totalAmount).toBe(20);
    expect(result.itemCount).toBe(1);
    expect(service.billingItems()).toEqual([]);
  });

  it('throws a generic error message for unexpected server errors', async () => {
    service.addItem({ productId: 1, name: 'Widget', price: 10, quantity: 1 });

    const checkoutPromise = service.checkout('Jane Doe', 'Card');

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    await expect(checkoutPromise).rejects.toThrow();
  });
});
