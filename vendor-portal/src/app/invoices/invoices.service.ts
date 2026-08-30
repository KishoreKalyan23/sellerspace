import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppConfigService } from '../shared/services/app-config/app-config.service';

export interface InvoiceListItem {
  orderId: number;
  clientName: string;
  customerMobile: string | null;
  paymentMethod: string;
  itemCount: number;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  status: string;
  wasCreatedOffline: boolean;
  createdAt: string;
}

export interface InvoiceLineItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
}

export interface InvoiceDetail {
  orderId: number;
  clientName: string;
  customerMobile: string | null;
  customerEmail: string | null;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  amountReceived: number | null;
  balanceReturned: number | null;
  wasCreatedOffline: boolean;
  createdAt: string;
  items: InvoiceLineItem[];
}

interface OrderSummary {
  orderId: number;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class InvoicesService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(AppConfigService);
  private get baseUrl(): string {
    return this.appConfig.apiBaseUrl;
  }

  readonly invoices = signal<InvoiceListItem[]>([]);

  async loadAll(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<InvoiceListItem[]>>(`${this.baseUrl}/api/vendor/invoices`),
      );
      this.invoices.set(response.data ?? []);
    } catch {
      this.invoices.set([]);
    }
  }

  async getById(orderId: number): Promise<InvoiceDetail | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<InvoiceDetail>>(`${this.baseUrl}/api/vendor/invoices/${orderId}`),
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async returnOrder(orderId: number): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<OrderSummary>>(`${this.baseUrl}/api/vendor/orders/${orderId}/return`, {}),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Could not return this invoice.');
      }

      this.invoices.update((invoices) =>
        invoices.map((invoice) => (invoice.orderId === orderId ? { ...invoice, status: 'Returned' } : invoice)),
      );
    } catch (error) {
      const backendMessage = (error as { error?: ApiResponse<OrderSummary> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Could not return this invoice.'));
    }
  }
}
