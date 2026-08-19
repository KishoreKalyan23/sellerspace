import { Component } from '@angular/core';

import { BillingSummaryComponent } from '../billing-summary/billing-summary.component';
import { ProductCatalogComponent } from '../product-catalog/product-catalog.component';

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [BillingSummaryComponent, ProductCatalogComponent],
  templateUrl: './billing-page.component.html',
  styleUrl: './billing-page.component.css',
})
export class BillingPageComponent {
}
