import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { get, set } from 'idb-keyval';

export type QueuedBillKind = 'simple' | 'pro';

export interface QueuedBill<TPayload = unknown> {
  localId: string;
  idempotencyKey: string;
  kind: QueuedBillKind;
  payload: TPayload;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  lastError?: string;
}

const STORAGE_KEY = 'vendor-portal.offline-billing-queue';

@Injectable({
  providedIn: 'root',
})
export class OfflineBillingQueueService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly pendingCount = signal(0);

  constructor() {
    void this.readAll().then((bills) => this.pendingCount.set(bills.filter((bill) => bill.status !== 'failed').length));
  }

  async enqueue<TPayload>(kind: QueuedBillKind, payload: TPayload): Promise<QueuedBill<TPayload>> {
    const bill: QueuedBill<TPayload> = {
      localId: this.generateId(),
      idempotencyKey: this.generateId(),
      kind,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
      attempts: 0,
    };

    const bills = await this.readAll();
    bills.push(bill);
    await this.writeAll(bills);
    return bill;
  }

  async getAll(): Promise<QueuedBill[]> {
    return this.readAll();
  }

  async remove(localId: string): Promise<void> {
    const bills = await this.readAll();
    await this.writeAll(bills.filter((bill) => bill.localId !== localId));
  }

  async markStatus(localId: string, status: QueuedBill['status'], lastError?: string): Promise<void> {
    const bills = await this.readAll();
    const updated = bills.map((bill) =>
      bill.localId === localId
        ? { ...bill, status, lastError, attempts: status === 'syncing' ? bill.attempts : bill.attempts + 1 }
        : bill,
    );
    await this.writeAll(updated);
  }

  async resetFailedToPending(): Promise<void> {
    const bills = await this.readAll();
    const updated = bills.map((bill) =>
      bill.status === 'failed' ? { ...bill, status: 'pending' as const, attempts: 0, lastError: undefined } : bill,
    );
    await this.writeAll(updated);
  }

  private async readAll(): Promise<QueuedBill[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const bills = await get<QueuedBill[]>(STORAGE_KEY);
    return bills ?? [];
  }

  private async writeAll(bills: QueuedBill[]): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await set(STORAGE_KEY, bills);
    this.pendingCount.set(bills.filter((bill) => bill.status !== 'failed').length);
  }

  private generateId(): string {
    return isPlatformBrowser(this.platformId) && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
