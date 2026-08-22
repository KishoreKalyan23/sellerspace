import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { InvoiceDetail, InvoicesService } from '../invoices.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, EmptyStateComponent, PageHeaderComponent],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css',
})
export class InvoiceListComponent implements OnInit {
  private readonly invoicesService = inject(InvoicesService);

  readonly invoices = this.invoicesService.invoices;
  readonly isLoading = signal(true);

  readonly selectedInvoice = signal<InvoiceDetail | null>(null);
  readonly isDetailLoading = signal(false);

  readonly returnConfirmOrderId = signal<number | null>(null);
  readonly isReturning = signal(false);
  readonly returnError = signal<string | null>(null);

  ngOnInit(): void {
    void this.invoicesService.loadAll().finally(() => this.isLoading.set(false));
  }

  async viewInvoice(orderId: number): Promise<void> {
    this.isDetailLoading.set(true);
    this.selectedInvoice.set(null);

    try {
      const detail = await this.invoicesService.getById(orderId);
      this.selectedInvoice.set(detail);
    } finally {
      this.isDetailLoading.set(false);
    }
  }

  closeDetail(): void {
    this.selectedInvoice.set(null);
  }

  requestReturn(orderId: number): void {
    this.returnError.set(null);
    this.returnConfirmOrderId.set(orderId);
  }

  cancelReturn(): void {
    this.returnConfirmOrderId.set(null);
  }

  async confirmReturn(): Promise<void> {
    const orderId = this.returnConfirmOrderId();
    if (orderId === null || this.isReturning()) {
      return;
    }

    this.isReturning.set(true);
    this.returnError.set(null);

    try {
      await this.invoicesService.returnOrder(orderId);
      this.returnConfirmOrderId.set(null);

      const current = this.selectedInvoice();
      if (current && current.orderId === orderId) {
        this.selectedInvoice.set({ ...current, status: 'Returned' });
      }
    } catch (error) {
      this.returnError.set(error instanceof Error ? error.message : 'Could not return this invoice.');
    } finally {
      this.isReturning.set(false);
    }
  }
}
