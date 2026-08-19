import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../shared/services/auth/auth.service';

interface ClientActivity {
  name: string;
  orderCount: number;
  lastOrderDate: string;
}

interface ProductMomentum {
  name: string;
  units: number;
  revenue: string;
  trend: string;
}

interface DashboardSummaryResponse {
  success: boolean;
  data: {
    totalClients: number;
    activeListings: number;
    netRevenue: number;
    ordersToday: number;
    fulfillmentRate: number;
    mostActiveClients: ClientActivity[];
    bestSellers: ProductMomentum[];
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly totalClients = signal(0);
  readonly activeListings = signal(0);
  readonly netRevenue = signal('₹0');
  readonly ordersToday = signal(0);
  readonly fulfillmentRate = signal('0%');
  readonly mostActiveClients = signal<ClientActivity[]>([]);
  readonly bestSellingProducts = signal<ProductMomentum[]>([]);
  readonly revenueTrend = signal<number[]>([38, 42, 31, 54, 62, 58, 74, 66, 80, 88, 92, 96]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isSidebarCollapsed = signal(false);

  readonly summary = computed(() => ({
    totalClients: this.totalClients(),
    mostActiveClients: this.mostActiveClients(),
  }));

  constructor() {
    this.http.get<DashboardSummaryResponse>('https://localhost:55142/api/vendor/dashboard-summary').subscribe({
      next: (response) => {
        this.applySummary(response.data);
      },
      error: () => {
        this.applySummary({
          totalClients: 128,
          activeListings: 86,
          netRevenue: 480000,
          ordersToday: 124,
          fulfillmentRate: 96.4,
          mostActiveClients: [
            { name: 'Northwind Living', orderCount: 54, lastOrderDate: '2026-08-12' },
            { name: 'Urban Cart', orderCount: 41, lastOrderDate: '2026-08-10' },
            { name: 'Aster & Co.', orderCount: 29, lastOrderDate: '2026-08-08' },
          ],
          bestSellers: [
            { name: 'Aurora Desk Lamp', units: 184, revenue: '₹1.89L', trend: '+12.4%' },
            { name: 'Terra Canvas Tote', units: 146, revenue: '₹1.47L', trend: '+9.3%' },
            { name: 'Echo Wireless Speaker', units: 121, revenue: '₹2.61L', trend: '+15.1%' },
          ],
        });
      },
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private applySummary(data: DashboardSummaryResponse['data']): void {
    this.totalClients.set(data.totalClients ?? 0);
    this.activeListings.set(data.activeListings ?? 0);
    this.netRevenue.set(this.formatCurrency(data.netRevenue ?? 0));
    this.ordersToday.set(data.ordersToday ?? 0);
    this.fulfillmentRate.set(`${(data.fulfillmentRate ?? 0).toFixed(1)}%`);
    this.mostActiveClients.set(data.mostActiveClients ?? []);
    this.bestSellingProducts.set(data.bestSellers ?? []);
    this.isLoading.set(false);
    this.error.set(null);
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  }
}
