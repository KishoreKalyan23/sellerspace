import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SalesReport, SalesReportService } from './sales-report.service';

describe('SalesReportService', () => {
  let service: SalesReportService;
  let httpMock: HttpTestingController;

  const report: SalesReport = {
    startDate: '2026-08-01',
    endDate: '2026-08-30',
    totalSales: 1000,
    totalOrders: 10,
    returnedAmount: 50,
    returnedOrders: 1,
    paymentMethodBreakdown: [
      { paymentMethod: 'Cash', amount: 600, orderCount: 6 },
      { paymentMethod: 'UPI', amount: 400, orderCount: 4 },
    ],
    lines: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SalesReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the sales report with the given date range', async () => {
    const reportPromise = service.getReport('2026-08-01', '2026-08-30');

    const req = httpMock.expectOne((r) => r.url === 'https://localhost:55142/api/vendor/sales-report');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('startDate')).toBe('2026-08-01');
    expect(req.request.params.get('endDate')).toBe('2026-08-30');
    req.flush({ success: true, data: report });

    const result = await reportPromise;

    expect(result).toEqual(report);
  });

  it('throws the backend error message when the report has no data', async () => {
    const reportPromise = service.getReport('2026-08-01', '2026-08-30');

    const req = httpMock.expectOne((r) => r.url === 'https://localhost:55142/api/vendor/sales-report');
    req.flush({ success: false, data: null, errors: ['No report available for this range'] });

    await expect(reportPromise).rejects.toThrow('No report available for this range');
  });

  it('throws a generic error message for unexpected server errors', async () => {
    const reportPromise = service.getReport('2026-08-01', '2026-08-30');

    const req = httpMock.expectOne((r) => r.url === 'https://localhost:55142/api/vendor/sales-report');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    await expect(reportPromise).rejects.toThrow();
  });

  it('finds payment amount and count case-insensitively', () => {
    expect(service.paymentAmount(report, 'cash')).toBe(600);
    expect(service.paymentCount(report, 'CASH')).toBe(6);
  });

  it('returns 0 for a payment method not present in the breakdown', () => {
    expect(service.paymentAmount(report, 'Card')).toBe(0);
    expect(service.paymentCount(report, 'Card')).toBe(0);
  });
});
