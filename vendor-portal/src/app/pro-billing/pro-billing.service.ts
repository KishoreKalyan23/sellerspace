import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppConfigService } from '../shared/services/app-config/app-config.service';
import { OfflineBillingQueueService } from '../shared/services/offline-billing/offline-billing-queue.service';

export interface ProBillingLineItem {
  productId: number;
  quantity: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'UPI';

export interface ProBillingCheckoutPayload {
  clientName: string;
  customerMobile?: string;
  customerEmail?: string;
  amountReceived?: number;
  paymentMethod: PaymentMethod;
  items: ProBillingLineItem[];
}

export interface ProBillingCheckoutResult {
  orderId: number;
  clientName: string;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  amountReceived: number | null;
  balanceReturned: number | null;
  itemCount: number;
  createdAt: string;
  isOfflinePending?: boolean;
}

export interface BillingCustomer {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ProBillingService {
  private readonly http = inject(HttpClient);
  private readonly offlineQueue = inject(OfflineBillingQueueService);
  private readonly appConfig = inject(AppConfigService);
  private get baseUrl(): string {
    return this.appConfig.apiBaseUrl;
  }

  async searchCustomers(query: string): Promise<BillingCustomer[]> {
    if (query.trim().length < 2) {
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<BillingCustomer[]>>(`${this.baseUrl}/api/vendor/customers/search`, {
          params: { q: query.trim() },
        }),
      );
      return response.data ?? [];
    } catch {
      return [];
    }
  }

  async checkout(payload: ProBillingCheckoutPayload): Promise<ProBillingCheckoutResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ProBillingCheckoutResult>>(`${this.baseUrl}/api/vendor/orders`, payload),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Checkout failed. Please try again.');
      }

      return response.data;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 0) {
        const queued = await this.offlineQueue.enqueue('pro', payload);
        return {
          orderId: 0,
          clientName: payload.clientName,
          totalAmount: 0,
          taxAmount: 0,
          grandTotal: 0,
          amountReceived: payload.amountReceived ?? null,
          balanceReturned: null,
          itemCount: payload.items.length,
          createdAt: queued.createdAt,
          isOfflinePending: true,
        };
      }

      const backendMessage = (error as { error?: ApiResponse<ProBillingCheckoutResult> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Checkout failed. Please try again.'));
    }
  }
}
