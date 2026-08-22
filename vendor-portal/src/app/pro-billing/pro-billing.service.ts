import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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
  private readonly baseUrl = 'https://localhost:55142';

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
      const backendMessage = (error as { error?: ApiResponse<ProBillingCheckoutResult> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Checkout failed. Please try again.'));
    }
  }
}
