import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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
  private readonly baseUrl = 'https://localhost:55142';

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
    const payload: CheckoutRequest = {
      clientName,
      paymentMethod,
      items: this.billingItems().map((item) => ({ productId: item.productId, quantity: item.quantity })),
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
      const backendMessage = (error as { error?: ApiResponse<CheckoutResult> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Checkout failed. Please try again.'));
    }
  }
}
