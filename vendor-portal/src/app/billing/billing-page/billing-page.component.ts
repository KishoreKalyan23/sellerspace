import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';

import { BillingSummaryComponent } from '../billing-summary/billing-summary.component';
import { ProductCatalogComponent } from '../product-catalog/product-catalog.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ProBillingComponent } from '../../pro-billing/pro-billing.component';
import { UserSettingsService } from '../../shared/services/user-settings/user-settings.service';
import { ConnectivityService } from '../../shared/services/connectivity/connectivity.service';
import { OfflineBillingQueueService, QueuedBill } from '../../shared/services/offline-billing/offline-billing-queue.service';
import { OfflineBillingSyncService } from '../../shared/services/offline-billing/offline-billing-sync.service';

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [CommonModule, BillingSummaryComponent, ProductCatalogComponent, PageHeaderComponent, ProBillingComponent],
  templateUrl: './billing-page.component.html',
  styleUrl: './billing-page.component.css',
})
export class BillingPageComponent implements OnInit {
  private readonly userSettingsService = inject(UserSettingsService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly queue = inject(OfflineBillingQueueService);
  private readonly sync = inject(OfflineBillingSyncService);

  readonly isProMode = signal(false);
  readonly isOnline = this.connectivity.isOnline;
  readonly isSyncing = this.sync.isSyncing;
  readonly pendingBills = signal<QueuedBill[]>([]);

  constructor() {
    effect(() => {
      this.sync.syncVersion();
      this.queue.pendingCount();
      void this.queue.getAll().then((bills) => this.pendingBills.set(bills));
    });
  }

  async ngOnInit(): Promise<void> {
    const settings = await this.userSettingsService.getSettings();
    this.isProMode.set(settings.useProBilling);
  }

  toggleProMode(): void {
    const next = !this.isProMode();
    this.isProMode.set(next);
    void this.userSettingsService.setUseProBilling(next);
  }

  retrySync(): void {
    void this.sync.retryNow();
  }

  billCustomerName(bill: QueuedBill): string {
    return (bill.payload as { clientName?: string }).clientName ?? 'Customer';
  }
}
