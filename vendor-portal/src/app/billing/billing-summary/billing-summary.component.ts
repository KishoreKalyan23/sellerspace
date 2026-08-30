import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { BillingService, PaymentMethod } from '../billing.service';
import { AppConfigService } from '../../shared/services/app-config/app-config.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ProductsService } from '../../shared/services/products/products.service';

@Component({
  selector: 'app-billing-summary',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonComponent, EmptyStateComponent],
  templateUrl: './billing-summary.component.html',
  styleUrl: './billing-summary.component.css',
})
export class BillingSummaryComponent {
  private readonly billingService = inject(BillingService);
  private readonly productsService = inject(ProductsService);
  private readonly appConfig = inject(AppConfigService);
  private get apiBaseUrl(): string {
    return this.appConfig.apiBaseUrl;
  }

  readonly billingItems = this.billingService.billingItems;
  readonly subtotal = this.billingService.subtotal;
  readonly total = this.billingService.total;

  readonly clientName = signal('');
  readonly paymentMethod = signal<PaymentMethod>('Cash');
  readonly isCheckingOut = signal(false);
  readonly checkoutError = signal<string | null>(null);
  readonly checkoutSuccess = signal<string | null>(null);
  readonly canCheckout = computed(
    () => this.billingItems().length > 0 && this.clientName().trim().length > 0 && !this.isCheckingOut(),
  );

  updateQuantity(productId: number, quantity: number): void {
    this.billingService.updateQuantity(productId, quantity);
  }

  changeQuantity(productId: number, quantity: number): void {
    this.billingService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.billingService.removeItem(productId);
  }

  updateClientName(event: Event): void {
    this.clientName.set((event.target as HTMLInputElement).value);
    this.checkoutError.set(null);
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  async checkout(): Promise<void> {
    if (!this.canCheckout()) {
      return;
    }

    this.isCheckingOut.set(true);
    this.checkoutError.set(null);
    this.checkoutSuccess.set(null);

    try {
      const result = await this.billingService.checkout(this.clientName().trim(), this.paymentMethod());
      this.checkoutSuccess.set(
        result.isOfflinePending
          ? `Bill saved offline for ${result.clientName}. It will sync automatically once you're back online.`
          : `Order #${result.orderId} placed for ${result.clientName}.`,
      );
      this.clientName.set('');
      this.paymentMethod.set('Cash');
    } catch (error) {
      this.checkoutError.set(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      this.isCheckingOut.set(false);
    }
  }

  imageUrl(productId: number): string | null {
    const product = this.productsService.getById(productId);
    return product?.imageUrl ? `${this.apiBaseUrl}${product.imageUrl}` : null;
  }
}
