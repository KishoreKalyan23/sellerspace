import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface FakeWorksheet {
  rows: unknown[][];
  rowObjects: { font?: unknown }[];
  columns: { width?: number }[];
}

interface FakeWorkbook {
  worksheet: FakeWorksheet;
  xlsx: { writeBuffer: ReturnType<typeof vi.fn> };
}

interface FakeJsPDF {
  fontSizeCalls: number[];
  textCalls: [string, number, number][];
  saveCalls: string[];
  lastAutoTable: { finalY: number };
}

const excelState = vi.hoisted(() => ({ instances: [] as FakeWorkbook[] }));
const pdfState = vi.hoisted(() => ({ instances: [] as FakeJsPDF[], autoTableCalls: [] as Record<string, unknown>[] }));

vi.mock('exceljs', () => {
  class MockWorksheet implements FakeWorksheet {
    rows: unknown[][] = [];
    rowObjects: { font?: unknown }[] = [];
    columns = Array.from({ length: 8 }, () => ({ width: undefined as number | undefined }));

    addRow(row: unknown[]) {
      this.rows.push(row);
      const rowObject: { font?: unknown } = {};
      this.rowObjects.push(rowObject);
      return rowObject;
    }
  }

  class MockWorkbook implements FakeWorkbook {
    worksheet = new MockWorksheet();
    xlsx = { writeBuffer: vi.fn(async () => new Uint8Array([1, 2, 3]).buffer) };

    constructor() {
      excelState.instances.push(this);
    }

    addWorksheet(_name: string) {
      return this.worksheet;
    }
  }

  return { default: { Workbook: MockWorkbook } };
});

vi.mock('jspdf', () => {
  class MockJsPDF implements FakeJsPDF {
    fontSizeCalls: number[] = [];
    textCalls: [string, number, number][] = [];
    saveCalls: string[] = [];
    lastAutoTable = { finalY: 0 };

    constructor() {
      pdfState.instances.push(this);
    }

    setFontSize(size: number) {
      this.fontSizeCalls.push(size);
    }

    text(value: string, x: number, y: number) {
      this.textCalls.push([value, x, y]);
    }

    save(fileName: string) {
      this.saveCalls.push(fileName);
    }
  }

  return { default: MockJsPDF };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn((doc: FakeJsPDF, options: Record<string, unknown>) => {
    pdfState.autoTableCalls.push(options);
    doc.lastAutoTable = { finalY: doc.lastAutoTable.finalY + 50 };
  }),
}));

import { SalesReport } from './sales-report.service';
import { SalesReportExportService } from './sales-report-export.service';

describe('SalesReportExportService', () => {
  let service: SalesReportExportService;
  let clickSpy: ReturnType<typeof vi.spyOn>;
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;

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
    lines: [
      {
        orderId: 1,
        createdAt: '2026-08-15T10:00:00.000Z',
        clientName: 'Jane Doe',
        paymentMethod: 'Cash',
        status: 'Completed',
        totalAmount: 100,
        taxAmount: 10,
        grandTotal: 110,
      },
    ],
  };

  beforeEach(() => {
    excelState.instances.length = 0;
    pdfState.instances.length = 0;
    pdfState.autoTableCalls.length = 0;
    service = new SalesReportExportService();

    clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    createObjectURLMock = vi.fn(() => 'blob:mock-url');
    revokeObjectURLMock = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL: createObjectURLMock, revokeObjectURL: revokeObjectURLMock });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('builds the excel workbook with summary and line rows, and triggers a download', async () => {
    await service.exportExcel(report, 'My Store');

    const workbook = excelState.instances.at(-1)!;
    const { rows } = workbook.worksheet;

    expect(rows[0]).toEqual(['My Store']);
    expect(rows[1]).toEqual(['Sales statement: 2026-08-01 to 2026-08-30']);
    expect(rows[3]).toEqual(['Total sales', 1000]);
    expect(rows[4]).toEqual(['Total orders', 10]);
    expect(rows[5]).toEqual(['Cash sales', 600, '6 order(s)']);
    expect(rows[6]).toEqual(['UPI sales', 400, '4 order(s)']);
    expect(rows[7]).toEqual(['Card sales', 0, '0 order(s)']);
    expect(rows[8]).toEqual(['Returned amount', 50, '1 order(s)']);

    const headerRowIndex = rows.findIndex((row) => row[0] === 'Order ID');
    expect(rows[headerRowIndex]).toEqual([
      'Order ID',
      'Date',
      'Client',
      'Payment method',
      'Status',
      'Subtotal',
      'Tax',
      'Grand total',
    ]);
    expect(workbook.worksheet.rowObjects[headerRowIndex].font).toEqual({ bold: true });

    const dataRow = rows[headerRowIndex + 1];
    expect(dataRow).toEqual([
      1,
      new Date('2026-08-15T10:00:00.000Z').toLocaleString(),
      'Jane Doe',
      'Cash',
      'Completed',
      100,
      10,
      110,
    ]);

    expect(workbook.worksheet.columns.every((column) => column.width === 18)).toBe(true);
    expect(workbook.xlsx.writeBuffer).toHaveBeenCalled();
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });

  it('builds two PDF tables and saves the file with the expected name', () => {
    service.exportPdf(report, 'My Store');

    const doc = pdfState.instances.at(-1)!;
    expect(doc.textCalls[0][0]).toBe('My Store');
    expect(doc.textCalls[1][0]).toBe('Sales statement: 2026-08-01 to 2026-08-30');

    expect(pdfState.autoTableCalls).toHaveLength(2);

    const summaryCall = pdfState.autoTableCalls[0];
    expect(summaryCall['head']).toEqual([['Summary', 'Amount', 'Orders']]);
    expect(summaryCall['body']).toEqual([
      ['Total sales', 'Rs. 1000.00', '10 order(s)'],
      ['Cash sales', 'Rs. 600.00', '6 order(s)'],
      ['UPI sales', 'Rs. 400.00', '4 order(s)'],
      ['Card sales', 'Rs. 0.00', '0 order(s)'],
      ['Returned', 'Rs. 50.00', '1 order(s)'],
    ]);

    const lineCall = pdfState.autoTableCalls[1];
    expect(lineCall['head']).toEqual([['Order ID', 'Date', 'Client', 'Payment', 'Status', 'Subtotal', 'Tax', 'Grand total']]);
    expect(lineCall['body']).toEqual([
      [1, new Date('2026-08-15T10:00:00.000Z').toLocaleString(), 'Jane Doe', 'Cash', 'Completed', 'Rs. 100.00', 'Rs. 10.00', 'Rs. 110.00'],
    ]);

    expect(doc.saveCalls).toEqual(['sales-statement-2026-08-01_to_2026-08-30.pdf']);
  });
});
