import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ConnectivityService } from '../../shared/services/connectivity/connectivity.service';
import { OfflineBillingQueueService, QueuedBill } from '../../shared/services/offline-billing/offline-billing-queue.service';
import { OfflineBillingSyncService } from '../../shared/services/offline-billing/offline-billing-sync.service';
import { UserSettingsService } from '../../shared/services/user-settings/user-settings.service';
import { BillingPageComponent } from './billing-page.component';

@Component({ selector: 'app-billing-summary', standalone: true, template: '' })
class StubBillingSummaryComponent {}

@Component({ selector: 'app-product-catalog', standalone: true, template: '' })
class StubProductCatalogComponent {}

@Component({ selector: 'app-pro-billing', standalone: true, template: '' })
class StubProBillingComponent {}

describe('BillingPageComponent', () => {
  let fixture: ComponentFixture<BillingPageComponent>;
  let component: BillingPageComponent;
  let userSettingsService: { getSettings: ReturnType<typeof vi.fn>; setUseProBilling: ReturnType<typeof vi.fn> };
  let connectivity: { isOnline: ReturnType<typeof vi.fn> };
  let queue: { pendingCount: ReturnType<typeof vi.fn>; getAll: ReturnType<typeof vi.fn> };
  let sync: { isSyncing: ReturnType<typeof vi.fn>; syncVersion: ReturnType<typeof vi.fn>; retryNow: ReturnType<typeof vi.fn> };

  function setup(bills: QueuedBill[] = [], useProBilling = false, isOnline = true): void {
    userSettingsService = {
      getSettings: vi.fn(async () => ({ useProBilling })),
      setUseProBilling: vi.fn(async () => {}),
    };
    connectivity = { isOnline: vi.fn(() => isOnline) };
    queue = { pendingCount: vi.fn(() => bills.length), getAll: vi.fn(async () => bills) };
    sync = { isSyncing: vi.fn(() => false), syncVersion: vi.fn(() => 0), retryNow: vi.fn(async () => {}) };

    TestBed.configureTestingModule({
      imports: [BillingPageComponent],
      providers: [
        { provide: UserSettingsService, useValue: userSettingsService },
        { provide: ConnectivityService, useValue: connectivity },
        { provide: OfflineBillingQueueService, useValue: queue },
        { provide: OfflineBillingSyncService, useValue: sync },
      ],
    }).overrideComponent(BillingPageComponent, {
      set: { imports: [CommonModule, PageHeaderComponent, StubBillingSummaryComponent, StubProductCatalogComponent, StubProBillingComponent] },
    });

    fixture = TestBed.createComponent(BillingPageComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the pro billing preference on init', async () => {
    setup([], true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(userSettingsService.getSettings).toHaveBeenCalled();
    expect(component.isProMode()).toBe(true);
  });

  it('populates pendingBills from the offline queue', async () => {
    const bills: QueuedBill[] = [
      { localId: 'a', idempotencyKey: 'a', kind: 'simple', payload: { clientName: 'Asha' }, createdAt: '', status: 'pending', attempts: 0 },
    ];
    setup(bills);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(queue.getAll).toHaveBeenCalled();
    expect(component.pendingBills()).toEqual(bills);
  });

  it('toggles pro mode and persists the preference', async () => {
    setup();
    fixture.detectChanges();
    await fixture.whenStable();

    component.toggleProMode();

    expect(component.isProMode()).toBe(true);
    expect(userSettingsService.setUseProBilling).toHaveBeenCalledWith(true);
  });

  it('retries sync via the sync service', async () => {
    setup();
    fixture.detectChanges();
    await fixture.whenStable();

    component.retrySync();

    expect(sync.retryNow).toHaveBeenCalled();
  });

  it('resolves the customer name from a queued bill payload, defaulting when absent', async () => {
    setup();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.billCustomerName({ payload: { clientName: 'Rahul' } } as QueuedBill)).toBe('Rahul');
    expect(component.billCustomerName({ payload: {} } as QueuedBill)).toBe('Customer');
  });

  it('shows the offline queue banner only when bills are pending', async () => {
    setup([
      { localId: 'a', idempotencyKey: 'a', kind: 'simple', payload: { clientName: 'Asha' }, createdAt: '', status: 'failed', attempts: 2, lastError: 'Network down' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.offline-queue-banner');
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('Network down');
  });

  it('renders the online/offline connectivity badge based on connectivity state', async () => {
    setup([], false, false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.connectivity-badge');
    expect(badge.classList).toContain('offline');
    expect(badge.textContent).toContain('Offline');
  });

  it('renders pro billing when pro mode is enabled, and the split panels otherwise', async () => {
    setup([], true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-pro-billing')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.billing-panels')).toBeFalsy();
  });
});
