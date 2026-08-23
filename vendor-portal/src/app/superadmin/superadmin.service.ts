import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ShopSummary {
  vendorId: number;
  name: string;
  storeName: string;
  email: string;
  isApproved: boolean;
  createdAt: string;
}

export interface ShopDashboardSummary {
  totalClients: number;
  activeListings: number;
  lowStockListings: number;
  outOfStockListings: number;
  netRevenue: number;
  ordersToday: number;
  ordersThisWeek: number;
  fulfillmentRate: number;
  averageOrderValue: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

export interface SuperAdminAuthResult {
  vendorId: number;
  name: string;
  role: 'SuperAdmin';
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class SuperAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:55142';

  readonly shops = signal<ShopSummary[]>([]);

  async getSetupStatus(): Promise<boolean> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<{ isSetupComplete: boolean }>>(`${this.baseUrl}/api/superadmin/setup/status`),
    );
    return response.data?.isSetupComplete ?? false;
  }

  async setup(payload: { name: string; email: string; password: string }): Promise<SuperAdminAuthResult> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<SuperAdminAuthResult>>(`${this.baseUrl}/api/superadmin/setup`, payload),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Could not complete setup.');
      }

      return response.data;
    } catch (error) {
      const backendMessage = (error as { error?: ApiResponse<SuperAdminAuthResult> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Could not complete setup.'));
    }
  }

  async loadShops(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<ShopSummary[]>>(`${this.baseUrl}/api/superadmin/shops`),
      );
      this.shops.set(response.data ?? []);
    } catch {
      this.shops.set([]);
    }
  }

  async getShopDetail(vendorId: number): Promise<ShopDashboardSummary | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<ShopDashboardSummary>>(`${this.baseUrl}/api/superadmin/shops/${vendorId}`),
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }
}
