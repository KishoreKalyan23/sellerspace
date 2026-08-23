import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

import { SalesReport } from './sales-report.service';

@Injectable({
  providedIn: 'root',
})
export class SalesReportExportService {
  async exportExcel(report: SalesReport, storeName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales statement');

    sheet.addRow([storeName]);
    sheet.addRow([`Sales statement: ${report.startDate} to ${report.endDate}`]);
    sheet.addRow([]);
    sheet.addRow(['Total sales', report.totalSales]);
    sheet.addRow(['Total orders', report.totalOrders]);
    for (const method of ['Cash', 'UPI', 'Card']) {
      const breakdown = report.paymentMethodBreakdown.find((b) => b.paymentMethod.toLowerCase() === method.toLowerCase());
      sheet.addRow([`${method} sales`, breakdown?.amount ?? 0, `${breakdown?.orderCount ?? 0} order(s)`]);
    }
    sheet.addRow(['Returned amount', report.returnedAmount, `${report.returnedOrders} order(s)`]);
    sheet.addRow([]);

    const headerRow = sheet.addRow(['Order ID', 'Date', 'Client', 'Payment method', 'Status', 'Subtotal', 'Tax', 'Grand total']);
    headerRow.font = { bold: true };

    for (const line of report.lines) {
      sheet.addRow([
        line.orderId,
        new Date(line.createdAt).toLocaleString(),
        line.clientName,
        line.paymentMethod,
        line.status,
        line.totalAmount,
        line.taxAmount,
        line.grandTotal,
      ]);
    }

    sheet.columns.forEach((column) => {
      column.width = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    this.downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      this.fileName(report, 'xlsx'),
    );
  }

  exportPdf(report: SalesReport, storeName: string): void {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(storeName, 14, 16);
    doc.setFontSize(10);
    doc.text(`Sales statement: ${report.startDate} to ${report.endDate}`, 14, 23);

    const summaryRows = [
      ['Total sales', this.currency(report.totalSales), `${report.totalOrders} order(s)`],
      ...['Cash', 'UPI', 'Card'].map((method) => {
        const breakdown = report.paymentMethodBreakdown.find((b) => b.paymentMethod.toLowerCase() === method.toLowerCase());
        return [`${method} sales`, this.currency(breakdown?.amount ?? 0), `${breakdown?.orderCount ?? 0} order(s)`];
      }),
      ['Returned', this.currency(report.returnedAmount), `${report.returnedOrders} order(s)`],
    ];

    autoTable(doc, {
      startY: 28,
      head: [['Summary', 'Amount', 'Orders']],
      body: summaryRows,
      theme: 'grid',
      styles: { fontSize: 9 },
    });

    const afterSummaryY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    autoTable(doc, {
      startY: afterSummaryY,
      head: [['Order ID', 'Date', 'Client', 'Payment', 'Status', 'Subtotal', 'Tax', 'Grand total']],
      body: report.lines.map((line) => [
        line.orderId,
        new Date(line.createdAt).toLocaleString(),
        line.clientName,
        line.paymentMethod,
        line.status,
        this.currency(line.totalAmount),
        this.currency(line.taxAmount),
        this.currency(line.grandTotal),
      ]),
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [31, 58, 92] },
    });

    doc.save(this.fileName(report, 'pdf'));
  }

  private currency(value: number): string {
    return `Rs. ${value.toFixed(2)}`;
  }

  private fileName(report: SalesReport, extension: string): string {
    return `sales-statement-${report.startDate}_to_${report.endDate}.${extension}`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
