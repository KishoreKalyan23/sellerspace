import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { BillingSummaryComponent } from '../billing-summary/billing-summary.component';
import { ProductCatalogComponent } from '../product-catalog/product-catalog.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ProBillingComponent } from '../../pro-billing/pro-billing.component';
import { UserSettingsService } from '../../shared/services/user-settings/user-settings.service';

@Component({
  selector: 'app-billing-page',
  standalone: true,
  imports: [CommonModule, BillingSummaryComponent, ProductCatalogComponent, PageHeaderComponent, ProBillingComponent],
  templateUrl: './billing-page.component.html',
  styleUrl: './billing-page.component.css',
})
export class BillingPageComponent implements OnInit {
  private readonly userSettingsService = inject(UserSettingsService);

  readonly isProMode = signal(false);

  async ngOnInit(): Promise<void> {
    const settings = await this.userSettingsService.getSettings();
    this.isProMode.set(settings.useProBilling);
  }

  toggleProMode(): void {
    const next = !this.isProMode();
    this.isProMode.set(next);
    void this.userSettingsService.setUseProBilling(next);
  }
}
