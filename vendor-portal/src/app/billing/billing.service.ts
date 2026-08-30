import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppConfigService } from '../shared/services/app-config/app-config.service';
import { OfflineBillingQueueService } from '../shared/services/offline-billing/offline-billing-queue.service';

export interface BillingItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutResult {
  orderId: number;
  clientName: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  isOfflinePending?: boolean;
}

export type PaymentMethod = 'Cash' | 'Card' | 'UPI';

interface CheckoutRequest {
  clientName: string;
  paymentMethod: PaymentMethod;
  items: { productId: number; quantity: number }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly offlineQueue = inject(OfflineBillingQueueService);
  private readonly appConfig = inject(AppConfigService);
  private get baseUrl(): string {
    return this.appConfig.apiBaseUrl;
  }

  readonly billingItems = signal<BillingItem[]>([]);
  readonly subtotal = computed(() =>
    this.billingItems().reduce((total, item) => total + item.price * item.quantity, 0),
  );
  readonly total = computed(() => this.subtotal());

  addItem(item: BillingItem): void {
    this.billingItems.update((items) => {
      const existingItem = items.find((currentItem) => currentItem.productId === item.productId);
      if (!existingItem) {
        return [...items, { ...item }];
      }

      return items.map((currentItem) =>
        currentItem.productId === item.productId
          ? { ...currentItem, quantity: currentItem.quantity + item.quantity }
          : currentItem,
      );
    });
  }

  removeItem(productId: number): void {
    this.billingItems.update((items) => items.filter((item) => item.productId !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    const normalizedQuantity = Math.max(1, Math.floor(quantity) || 1);
    this.billingItems.update((items) =>
      items.map((item) => item.productId === productId ? { ...item, quantity: normalizedQuantity } : item),
    );
  }

  async checkout(clientName: string, paymentMethod: PaymentMethod): Promise<CheckoutResult> {
    const items = this.billingItems();
    const payload: CheckoutRequest = {
      clientName,
      paymentMethod,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    };

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<CheckoutResult>>(`${this.baseUrl}/api/vendor/orders`, payload),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Checkout failed. Please try again.');
      }

      this.billingItems.set([]);
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 0) {
        const queued = await this.offlineQueue.enqueue('simple', payload);
        this.billingItems.set([]);
        return {
          orderId: 0,
          clientName,
          totalAmount: items.reduce((total, item) => total + item.price * item.quantity, 0),
          itemCount: items.length,
          createdAt: queued.createdAt,
          isOfflinePending: true,
        };
      }

      const backendMessage = (error as { error?: ApiResponse<CheckoutResult> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Checkout failed. Please try again.'));
    }
  }
}
