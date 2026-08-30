import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConnectivityService } from '../connectivity/connectivity.service';
import { OfflineBillingQueueService, QueuedBill } from './offline-billing-queue.service';
import { OfflineBillingSyncService } from './offline-billing-sync.service';

async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

function makeBill(overrides: Partial<QueuedBill> = {}): QueuedBill {
  return {
    localId: 'local-1',
    idempotencyKey: 'idem-1',
    kind: 'simple',
    payload: { clientName: 'Jane Doe' },
    createdAt: '2026-08-30T00:00:00.000Z',
    status: 'pending',
    attempts: 0,
    ...overrides,
  };
}

describe('OfflineBillingSyncService', () => {
  let service: OfflineBillingSyncService;
  let httpMock: HttpTestingController;
  let connectivityMock: { isOnline: ReturnType<typeof signal<boolean>> };
  let queueMock: {
    pendingCount: ReturnType<typeof signal<number>>;
    getAll: ReturnType<typeof vi.fn>;
    markStatus: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    resetFailedToPending: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();

    connectivityMock = { isOnline: signal(false) };
    queueMock = {
      pendingCount: signal(0),
      getAll: vi.fn(async () => [] as QueuedBill[]),
      markStatus: vi.fn(async () => {}),
      remove: vi.fn(async () => {}),
      resetFailedToPending: vi.fn(async () => {}),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConnectivityService, useValue: connectivityMock },
        { provide: OfflineBillingQueueService, useValue: queueMock },
      ],
    });

    service = TestBed.inject(OfflineBillingSyncService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('does nothing when there are no syncable bills queued', async () => {
    await service.syncNow();

    expect(queueMock.getAll).toHaveBeenCalled();
    expect(service.isSyncing()).toBe(false);
  });

  it('skips syncing when a sync is already in progress', async () => {
    service.isSyncing.set(true);

    await service.syncNow();

    expect(queueMock.getAll).not.toHaveBeenCalled();
  });

  it('syncs a pending bill successfully and removes it from the queue', async () => {
    queueMock.getAll.mockResolvedValue([makeBill()]);

    const syncPromise = service.syncNow();
    await flushMicrotasks();

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ clientName: 'Jane Doe', idempotencyKey: 'idem-1' });
    req.flush({ success: true, data: { orderId: 5, clientName: 'Jane Doe' } });

    await syncPromise;

    expect(queueMock.markStatus).toHaveBeenCalledWith('local-1', 'syncing');
    expect(queueMock.remove).toHaveBeenCalledWith('local-1');
    expect(service.isSyncing()).toBe(false);
    expect(service.syncVersion()).toBe(1);
  });

  it('keeps a bill pending for retry on a network error below the max attempts', async () => {
    queueMock.getAll.mockResolvedValue([makeBill({ attempts: 1 })]);

    const syncPromise = service.syncNow();
    await flushMicrotasks();

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    await syncPromise;

    expect(queueMock.markStatus).toHaveBeenCalledWith(
      'local-1',
      'pending',
      'Still offline — will retry automatically.',
    );
    expect(queueMock.remove).not.toHaveBeenCalled();
  });

  it('marks a bill failed once the max network retry attempts are reached', async () => {
    queueMock.getAll.mockResolvedValue([makeBill({ attempts: 4 })]);

    const syncPromise = service.syncNow();
    await flushMicrotasks();

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    await syncPromise;

    expect(queueMock.markStatus).toHaveBeenCalledWith(
      'local-1',
      'failed',
      'Could not reach the server after several attempts. Check your connection and retry manually.',
    );
  });

  it('marks a bill failed with the backend error message on a non-network error', async () => {
    queueMock.getAll.mockResolvedValue([makeBill()]);

    const syncPromise = service.syncNow();
    await flushMicrotasks();

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.flush(
      { success: false, data: null, errors: ['Insufficient stock'] },
      { status: 400, statusText: 'Bad Request' },
    );

    await syncPromise;

    expect(queueMock.markStatus).toHaveBeenCalledWith('local-1', 'failed', 'Insufficient stock');
  });

  it('marks a bill failed with a default message when the server reports no data and no errors', async () => {
    queueMock.getAll.mockResolvedValue([makeBill()]);

    const syncPromise = service.syncNow();
    await flushMicrotasks();

    const req = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    req.flush({ success: false, data: null });

    await syncPromise;

    expect(queueMock.markStatus).toHaveBeenCalledWith(
      'local-1',
      'failed',
      'This bill could not be synced. Please review it.',
    );
  });

  it('processes multiple queued bills sequentially', async () => {
    queueMock.getAll.mockResolvedValue([makeBill({ localId: 'local-1' }), makeBill({ localId: 'local-2' })]);

    const syncPromise = service.syncNow();
    await flushMicrotasks();

    const firstReq = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    firstReq.flush({ success: true, data: { orderId: 1, clientName: 'Jane Doe' } });

    await flushMicrotasks();

    const secondReq = httpMock.expectOne('https://localhost:55142/api/vendor/orders');
    secondReq.flush({ success: true, data: { orderId: 2, clientName: 'Jane Doe' } });

    await syncPromise;

    expect(queueMock.remove).toHaveBeenCalledWith('local-1');
    expect(queueMock.remove).toHaveBeenCalledWith('local-2');
  });

  it('resets failed bills to pending and then syncs on retryNow', async () => {
    queueMock.getAll.mockResolvedValue([]);

    await service.retryNow();

    expect(queueMock.resetFailedToPending).toHaveBeenCalled();
    expect(queueMock.getAll).toHaveBeenCalled();
  });
});
