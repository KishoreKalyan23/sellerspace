import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { clear } from 'idb-keyval';
import { beforeEach, describe, expect, it } from 'vitest';

import { OfflineBillingQueueService } from './offline-billing-queue.service';

describe('OfflineBillingQueueService', () => {
  let service: OfflineBillingQueueService;

  beforeEach(async () => {
    await clear();
    service = TestBed.inject(OfflineBillingQueueService);
  });

  it('enqueues a bill as pending with zero attempts', async () => {
    const bill = await service.enqueue('simple', { total: 100 });

    expect(bill.status).toBe('pending');
    expect(bill.attempts).toBe(0);
    expect(bill.kind).toBe('simple');

    const all = await service.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].localId).toBe(bill.localId);
  });

  it('removes a bill by localId', async () => {
    const bill = await service.enqueue('pro', { total: 200 });
    await service.remove(bill.localId);

    expect(await service.getAll()).toHaveLength(0);
  });

  it('marks a bill failed and increments attempts, but not while syncing', async () => {
    const bill = await service.enqueue('simple', { total: 50 });

    await service.markStatus(bill.localId, 'syncing');
    let [updated] = await service.getAll();
    expect(updated.status).toBe('syncing');
    expect(updated.attempts).toBe(0);

    await service.markStatus(bill.localId, 'failed', 'network error');
    [updated] = await service.getAll();
    expect(updated.status).toBe('failed');
    expect(updated.attempts).toBe(1);
    expect(updated.lastError).toBe('network error');
  });

  it('resets failed bills back to pending and clears attempts/errors', async () => {
    const bill = await service.enqueue('simple', { total: 75 });
    await service.markStatus(bill.localId, 'failed', 'boom');

    await service.resetFailedToPending();

    const [updated] = await service.getAll();
    expect(updated.status).toBe('pending');
    expect(updated.attempts).toBe(0);
    expect(updated.lastError).toBeUndefined();
  });

  it('keeps pendingCount in sync with non-failed bills', async () => {
    const bill = await service.enqueue('simple', { total: 10 });
    expect(service.pendingCount()).toBe(1);

    await service.markStatus(bill.localId, 'failed', 'oops');
    expect(service.pendingCount()).toBe(0);
  });
});
