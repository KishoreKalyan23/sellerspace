import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConnectivityService } from '../connectivity/connectivity.service';
import { OfflineBillingQueueService, QueuedBill } from './offline-billing-queue.service';

const RETRY_INTERVAL_MS = 30_000;
const MAX_NETWORK_RETRY_ATTEMPTS = 5;

interface SyncResponse {
  success: boolean;
  data: { orderId: number; clientName: string } | null;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class OfflineBillingSyncService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly connectivity = inject(ConnectivityService);
  private readonly queue = inject(OfflineBillingQueueService);
  private readonly baseUrl = 'https://localhost:55142';

  readonly isSyncing = signal(false);
  readonly syncVersion = signal(0);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    effect(() => {
      if (this.connectivity.isOnline() && this.queue.pendingCount() > 0) {
        void this.syncNow();
      }
    });

    setInterval(() => {
      if (this.connectivity.isOnline() && this.queue.pendingCount() > 0) {
        void this.syncNow();
      }
    }, RETRY_INTERVAL_MS);
  }

  async retryNow(): Promise<void> {
    await this.queue.resetFailedToPending();
    await this.syncNow();
  }

  async syncNow(): Promise<void> {
    if (this.isSyncing()) {
      return;
    }

    const bills = (await this.queue.getAll()).filter((bill) => bill.status !== 'failed');
    if (bills.length === 0) {
      return;
    }

    this.isSyncing.set(true);
    try {
      for (const bill of bills) {
        await this.syncOne(bill);
      }
    } finally {
      this.isSyncing.set(false);
      this.syncVersion.update((version) => version + 1);
    }
  }

  private async syncOne(bill: QueuedBill): Promise<void> {
    await this.queue.markStatus(bill.localId, 'syncing');

    try {
      const payload = { ...(bill.payload as Record<string, unknown>), idempotencyKey: bill.idempotencyKey };
      const response = await firstValueFrom(
        this.http.post<SyncResponse>(`${this.baseUrl}/api/vendor/orders`, payload),
      );

      if (!response.data) {
        throw { status: 400, error: response } as HttpErrorResponse;
      }

      await this.queue.remove(bill.localId);
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      if (httpError?.status === 0) {
        if (bill.attempts + 1 >= MAX_NETWORK_RETRY_ATTEMPTS) {
          await this.queue.markStatus(
            bill.localId,
            'failed',
            'Could not reach the server after several attempts. Check your connection and retry manually.',
          );
        } else {
          await this.queue.markStatus(bill.localId, 'pending', 'Still offline — will retry automatically.');
        }
      } else {
        const backendMessage = (httpError?.error as SyncResponse | undefined)?.errors?.[0];
        await this.queue.markStatus(
          bill.localId,
          'failed',
          backendMessage ?? (error instanceof Error ? error.message : 'This bill could not be synced. Please review it.'),
        );
      }
    }
  }
}
