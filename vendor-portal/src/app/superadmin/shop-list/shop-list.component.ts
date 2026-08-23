import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { SuperAdminService } from '../superadmin.service';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent, PageHeaderComponent],
  templateUrl: './shop-list.component.html',
  styleUrl: './shop-list.component.css',
})
export class ShopListComponent implements OnInit {
  private readonly superAdminService = inject(SuperAdminService);

  readonly shops = this.superAdminService.shops;
  readonly isLoading = signal(true);

  ngOnInit(): void {
    void this.superAdminService.loadShops().finally(() => this.isLoading.set(false));
  }
}
