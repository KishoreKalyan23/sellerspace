import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

import { BillingSummaryComponent } from '../billing-summary/billing-summary.component';
import { ProductCatalogComponent } from '../product-catalog/product-catalog.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ProBillingComponent } from '../../pro-billing/pro-billing.component';

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [CommonModule, BillingSummaryComponent, ProductCatalogComponent, PageHeaderComponent, ProBillingComponent],
  templateUrl: './billing-page.component.html',
  styleUrl: './billing-page.component.css',
})
export class BillingPageComponent {
  readonly isProMode = signal(false);

  toggleProMode(): void {
    this.isProMode.update((value) => !value);
  }
}
