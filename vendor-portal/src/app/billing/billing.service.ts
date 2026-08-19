import { Injectable, computed, signal } from '@angular/core';

export interface BillingItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class BillingService {
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
}
