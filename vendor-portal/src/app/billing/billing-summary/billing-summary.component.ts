import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { BillingService } from '../billing.service';

@Component({
  selector: 'app-billing-summary',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './billing-summary.component.html',
  styleUrl: './billing-summary.component.css',
})
export class BillingSummaryComponent {
  private readonly billingService = inject(BillingService);

  readonly billingItems = this.billingService.billingItems;
  readonly subtotal = this.billingService.subtotal;
  readonly total = this.billingService.total;

  updateQuantity(productId: number, quantity: number): void {
    this.billingService.updateQuantity(productId, quantity);
  }

  changeQuantity(productId: number, quantity: number): void {
    this.billingService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.billingService.removeItem(productId);
  }
}
