import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService, Vendor } from '../../shared/services/auth/auth.service';
import { SalesReportExportService } from './sales-report-export.service';
import { SalesReport, SalesReportService } from './sales-report.service';
import { SalesReportComponent } from './sales-report.component';

describe('SalesReportComponent', () => {
  let fixture: ComponentFixture<SalesReportComponent>;
  let component: SalesReportComponent;
  let salesReportService: {
    getReport: ReturnType<typeof vi.fn>;
    paymentAmount: ReturnType<typeof vi.fn>;
    paymentCount: ReturnType<typeof vi.fn>;
  };
  let exportService: { exportExcel: ReturnType<typeof vi.fn>; exportPdf: ReturnType<typeof vi.fn> };

  const vendor: Vendor = { id: '1', name: 'Jane', email: 'jane@example.com', storeName: 'Jane Store', role: 'ShopAdmin' };

  const report: SalesReport = {
    startDate: '2026-08-30',
    endDate: '2026-08-30',
    totalSales: 1000,
    totalOrders: 5,
    returnedAmount: 100,
    returnedOrders: 1,
    paymentMethodBreakdown: [
      { paymentMethod: 'Cash', amount: 600, orderCount: 3 },
      { paymentMethod: 'UPI', amount: 400, orderCount: 2 },
    ],
    lines: [
      {
        orderId: 501,
        createdAt: '2026-08-30T10:00:00Z',
        clientName: 'Alice',
        paymentMethod: 'Cash',
        status: 'Completed',
        totalAmount: 200,
        taxAmount: 20,
        grandTotal: 220,
      },
    ],
  };

  beforeEach(() => {
    salesReportService = {
      getReport: vi.fn(() => Promise.resolve(report)),
      paymentAmount: vi.fn(
        (r: SalesReport, method: string) =>
          r.paymentMethodBreakdown.find((b) => b.paymentMethod === method)?.amount ?? 0,
      ),
      paymentCount: vi.fn(
        (r: SalesReport, method: string) =>
          r.paymentMethodBreakdown.find((b) => b.paymentMethod === method)?.orderCount ?? 0,
      ),
    };
    exportService = {
      exportExcel: vi.fn(() => Promise.resolve()),
      exportPdf: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SalesReportService, useValue: salesReportService },
        { provide: SalesReportExportService, useValue: exportService },
        { provide: AuthService, useValue: { currentVendor: vi.fn(() => vendor) } },
      ],
    });

    fixture = TestBed.createComponent(SalesReportComponent);
    component = fixture.componentInstance;
  });

  it('loads a single-day report on init', async () => {
    fixture.detectChanges();
    expect(salesReportService.getReport).toHaveBeenCalledWith(component.selectedDate(), component.selectedDate());
    await fixture.whenStable();

    expect(component.report()).toEqual(report);
    expect(component.isLoading()).toBe(false);
  });

  it('renders the report totals and line items', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('1000.00');
    expect(text).toContain('Alice');
    expect(text).toContain('220.00');
  });

  it('switches to range mode and reloads with the range dates', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.rangeStart.set('2026-08-01');
    component.rangeEnd.set('2026-08-30');
    component.setMode('range');

    expect(salesReportService.getReport).toHaveBeenCalledWith('2026-08-01', '2026-08-30');
    expect(component.mode()).toBe('range');
  });

  it('surfaces an error and clears the report when loading fails', async () => {
    salesReportService.getReport = vi.fn(() => Promise.reject(new Error('Server down')));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.error()).toBe('Server down');
    expect(component.report()).toBeNull();
  });

  it('shows an empty state when the report has no lines', async () => {
    salesReportService.getReport = vi.fn(() => Promise.resolve({ ...report, lines: [] }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No orders in this date range.');
  });

  it('exports to Excel with the current report and store name', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    await component.exportExcel();

    expect(exportService.exportExcel).toHaveBeenCalledWith(report, 'Jane Store');
  });

  it('exports to PDF with the current report and store name', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.exportPdf();

    expect(exportService.exportPdf).toHaveBeenCalledWith(report, 'Jane Store');
  });

  it('does not export when there is no report loaded', async () => {
    salesReportService.getReport = vi.fn(() => Promise.reject(new Error('fail')));
    fixture.detectChanges();
    await fixture.whenStable();

    component.exportPdf();
    await component.exportExcel();

    expect(exportService.exportPdf).not.toHaveBeenCalled();
    expect(exportService.exportExcel).not.toHaveBeenCalled();
  });
});
