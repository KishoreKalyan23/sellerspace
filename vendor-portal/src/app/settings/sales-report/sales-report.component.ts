import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { AuthService } from '../../shared/services/auth/auth.service';
import { SalesReport, SalesReportService } from './sales-report.service';
import { SalesReportExportService } from './sales-report-export.service';

type ReportMode = 'day' | 'range';

function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonComponent, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.css',
})
export class SalesReportComponent implements OnInit {
  private readonly salesReportService = inject(SalesReportService);
  private readonly exportService = inject(SalesReportExportService);
  private readonly authService = inject(AuthService);

  readonly mode = signal<ReportMode>('day');
  readonly selectedDate = signal(todayIso());
  readonly rangeStart = signal(todayIso());
  readonly rangeEnd = signal(todayIso());

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly report = signal<SalesReport | null>(null);
  readonly isExporting = signal(false);

  readonly effectiveStart = computed(() => (this.mode() === 'day' ? this.selectedDate() : this.rangeStart()));
  readonly effectiveEnd = computed(() => (this.mode() === 'day' ? this.selectedDate() : this.rangeEnd()));

  ngOnInit(): void {
    void this.loadReport();
  }

  setMode(mode: ReportMode): void {
    this.mode.set(mode);
    void this.loadReport();
  }

  onDateInput(event: Event): void {
    this.selectedDate.set((event.target as HTMLInputElement).value);
  }

  onRangeStartInput(event: Event): void {
    this.rangeStart.set((event.target as HTMLInputElement).value);
  }

  onRangeEndInput(event: Event): void {
    this.rangeEnd.set((event.target as HTMLInputElement).value);
  }

  async loadReport(): Promise<void> {
    const start = this.effectiveStart();
    const end = this.effectiveEnd();
    if (!start || !end) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.salesReportService.getReport(start, end);
      this.report.set(result);
    } catch (error) {
      this.report.set(null);
      this.error.set(error instanceof Error ? error.message : 'Could not load the sales report.');
    } finally {
      this.isLoading.set(false);
    }
  }

  paymentAmount(method: string): number {
    const report = this.report();
    return report ? this.salesReportService.paymentAmount(report, method) : 0;
  }

  paymentCount(method: string): number {
    const report = this.report();
    return report ? this.salesReportService.paymentCount(report, method) : 0;
  }

  async exportExcel(): Promise<void> {
    const report = this.report();
    if (!report || this.isExporting()) {
      return;
    }

    this.isExporting.set(true);
    try {
      await this.exportService.exportExcel(report, this.storeName());
    } finally {
      this.isExporting.set(false);
    }
  }

  exportPdf(): void {
    const report = this.report();
    if (!report) {
      return;
    }

    this.exportService.exportPdf(report, this.storeName());
  }

  private storeName(): string {
    return this.authService.currentVendor()?.storeName ?? 'Store';
  }
}
