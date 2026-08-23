import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ShopDashboardSummary, SuperAdminService } from '../superadmin.service';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  templateUrl: './shop-detail.component.html',
  styleUrl: './shop-detail.component.css',
})
export class ShopDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly superAdminService = inject(SuperAdminService);

  readonly isLoading = signal(true);
  readonly summary = signal<ShopDashboardSummary | null>(null);

  ngOnInit(): void {
    const vendorId = Number(this.route.snapshot.paramMap.get('vendorId'));
    void this.superAdminService
      .getShopDetail(vendorId)
      .then((summary) => this.summary.set(summary))
      .finally(() => this.isLoading.set(false));
  }
}
