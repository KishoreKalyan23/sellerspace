import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConnectivityService } from '../../shared/services/connectivity/connectivity.service';
import { OfflineBillingQueueService, QueuedBill } from '../../shared/services/offline-billing/offline-billing-queue.service';
import { OfflineBillingSyncService } from '../../shared/services/offline-billing/offline-billing-sync.service';
import { InvoiceDetail, InvoiceListItem, InvoicesService } from '../invoices.service';
import { InvoiceListComponent } from './invoice-list.component';

describe('InvoiceListComponent', () => {
  let fixture: ComponentFixture<InvoiceListComponent>;
  let component: InvoiceListComponent;
  let invoicesService: {
    invoices: ReturnType<typeof vi.fn>;
    loadAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    returnOrder: ReturnType<typeof vi.fn>;
  };
  let connectivity: { isOnline: ReturnType<typeof vi.fn> };
  let queue: { pendingCount: ReturnType<typeof vi.fn>; getAll: ReturnType<typeof vi.fn> };
  let sync: { isSyncing: ReturnType<typeof vi.fn>; syncVersion: ReturnType<typeof vi.fn>; retryNow: ReturnType<typeof vi.fn> };

  const invoices: InvoiceListItem[] = [
    {
      orderId: 101,
      clientName: 'Alice',
      customerMobile: '9999999999',
      paymentMethod: 'Cash',
      itemCount: 2,
      totalAmount: 200,
      taxAmount: 20,
      grandTotal: 220,
      status: 'Completed',
      wasCreatedOffline: false,
      createdAt: '2026-08-30T10:00:00Z',
    },
  ];

  const invoiceDetail: InvoiceDetail = {
    orderId: 101,
    clientName: 'Alice',
    customerMobile: '9999999999',
    customerEmail: null,
    paymentMethod: 'Cash',
    status: 'Completed',
    totalAmount: 200,
    taxAmount: 20,
    grandTotal: 220,
    amountReceived: 220,
    balanceReturned: 0,
    wasCreatedOffline: false,
    createdAt: '2026-08-30T10:00:00Z',
    items: [],
  };

  beforeEach(() => {
    invoicesService = {
      invoices: vi.fn(() => invoices),
      loadAll: vi.fn(() => Promise.resolve()),
      getById: vi.fn(() => Promise.resolve(invoiceDetail)),
      returnOrder: vi.fn(() => Promise.resolve()),
    };
    connectivity = { isOnline: vi.fn(() => true) };
    queue = { pendingCount: vi.fn(() => 0), getAll: vi.fn(() => Promise.resolve<QueuedBill[]>([])) };
    sync = { isSyncing: vi.fn(() => false), syncVersion: vi.fn(() => 0), retryNow: vi.fn(() => Promise.resolve()) };

    TestBed.configureTestingModule({
      providers: [
        { provide: InvoicesService, useValue: invoicesService },
        { provide: ConnectivityService, useValue: connectivity },
        { provide: OfflineBillingQueueService, useValue: queue },
        { provide: OfflineBillingSyncService, useValue: sync },
      ],
    });

    fixture = TestBed.createComponent(InvoiceListComponent);
    component = fixture.componentInstance;
  });

  it('loads invoices on init and clears loading state', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(invoicesService.loadAll).toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
  });

  it('renders the invoice list', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Alice');
    expect(text).toContain('Cash');
  });

  it('shows an empty state when there are no invoices', async () => {
    invoicesService.invoices.mockReturnValue([]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No invoices yet.');
  });

  it('shows the pending bills panel when there are queued bills', async () => {
    const bill: QueuedBill = {
      localId: 'a',
      idempotencyKey: 'b',
      kind: 'simple',
      payload: { clientName: 'Offline Customer' },
      createdAt: '2026-08-30T09:00:00Z',
      status: 'pending',
      attempts: 0,
    };
    queue.getAll = vi.fn(() => Promise.resolve([bill]));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Bills awaiting sync');
    expect(text).toContain('Offline Customer');
  });

  it('retries sync when requested', () => {
    fixture.detectChanges();
    component.retrySync();

    expect(sync.retryNow).toHaveBeenCalled();
  });

  it('loads and shows invoice detail', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await component.viewInvoice(101);

    expect(invoicesService.getById).toHaveBeenCalledWith(101);
    expect(component.selectedInvoice()).toEqual(invoiceDetail);
    expect(component.isDetailLoading()).toBe(false);
  });

  it('confirms a return and updates the invoice status locally', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await component.viewInvoice(101);
    component.requestReturn(101);
    expect(component.returnConfirmOrderId()).toBe(101);

    await component.confirmReturn();

    expect(invoicesService.returnOrder).toHaveBeenCalledWith(101);
    expect(component.returnConfirmOrderId()).toBeNull();
    expect(component.selectedInvoice()?.status).toBe('Returned');
  });

  it('cancels a return without calling the service', () => {
    fixture.detectChanges();
    component.requestReturn(101);
    component.cancelReturn();

    expect(component.returnConfirmOrderId()).toBeNull();
    expect(invoicesService.returnOrder).not.toHaveBeenCalled();
  });

  it('surfaces an error when the return fails', async () => {
    invoicesService.returnOrder = vi.fn(() => Promise.reject(new Error('Cannot return')));
    fixture.detectChanges();
    component.requestReturn(101);

    await component.confirmReturn();

    expect(component.returnError()).toBe('Cannot return');
    expect(component.returnConfirmOrderId()).toBe(101);
  });
});
