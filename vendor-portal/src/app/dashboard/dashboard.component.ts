import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';

import { EmptyStateComponent } from '../shared/ui/empty-state/empty-state.component';

interface ClientActivity {
  name: string;
  orderCount: number;
  lastOrderDate: string;
}

interface ProductMomentum {
  name: string;
  units: number;
  revenue: number;
  revenueSharePercent: number;
}

interface DashboardSummaryResponse {
  success: boolean;
  data: {
    totalClients: number;
    activeListings: number;
    lowStockListings: number;
    outOfStockListings: number;
    netRevenue: number;
    ordersToday: number;
    ordersThisWeek: number;
    fulfillmentRate: number;
    averageOrderValue: number;
    netRevenueWeekOverWeekChange: number;
    revenueTrend: number[];
    mostActiveClients: ClientActivity[];
    bestSellers: ProductMomentum[];
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly http = inject(HttpClient);

  readonly totalClients = signal(0);
  readonly activeListings = signal(0);
  readonly lowStockListings = signal(0);
  readonly outOfStockListings = signal(0);
  readonly netRevenue = signal(0);
  readonly ordersToday = signal(0);
  readonly ordersThisWeek = signal(0);
  readonly fulfillmentRate = signal(0);
  readonly averageOrderValue = signal(0);
  readonly netRevenueWeekOverWeekChange = signal(0);
  readonly revenueTrend = signal<number[]>([]);
  readonly mostActiveClients = signal<ClientActivity[]>([]);
  readonly bestSellingProducts = signal<ProductMomentum[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isSidebarCollapsed = signal(false);

  readonly inventoryStatus = computed(() => (this.outOfStockListings() > 0 ? 'Attention needed' : 'Stable'));
  readonly revenueChartBars = computed(() => {
    const trend = this.revenueTrend();
    const max = Math.max(...trend, 1);
    return trend.map((value) => Math.max(4, Math.round((value / max) * 100)));
  });

  constructor() {
    this.http.get<DashboardSummaryResponse>('https://localhost:55142/api/vendor/dashboard-summary').subscribe({
      next: (response) => {
        this.applySummary(response.data);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Unable to load dashboard data. Please try again later.');
      },
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  private applySummary(data: DashboardSummaryResponse['data']): void {
    this.totalClients.set(data.totalClients ?? 0);
    this.activeListings.set(data.activeListings ?? 0);
    this.lowStockListings.set(data.lowStockListings ?? 0);
    this.outOfStockListings.set(data.outOfStockListings ?? 0);
    this.netRevenue.set(data.netRevenue ?? 0);
    this.ordersToday.set(data.ordersToday ?? 0);
    this.ordersThisWeek.set(data.ordersThisWeek ?? 0);
    this.fulfillmentRate.set(data.fulfillmentRate ?? 0);
    this.averageOrderValue.set(data.averageOrderValue ?? 0);
    this.netRevenueWeekOverWeekChange.set(data.netRevenueWeekOverWeekChange ?? 0);
    this.revenueTrend.set(data.revenueTrend ?? []);
    this.mostActiveClients.set(data.mostActiveClients ?? []);
    this.bestSellingProducts.set(data.bestSellers ?? []);
    this.isLoading.set(false);
    this.error.set(null);
  }
}
