import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppConfigService } from '../../shared/services/app-config/app-config.service';

export interface PaymentMethodBreakdown {
  paymentMethod: string;
  amount: number;
  orderCount: number;
}

export interface SalesReportLine {
  orderId: number;
  createdAt: string;
  clientName: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export interface SalesReport {
  startDate: string;
  endDate: string;
  totalSales: number;
  totalOrders: number;
  returnedAmount: number;
  returnedOrders: number;
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  lines: SalesReportLine[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SalesReportService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(AppConfigService);
  private get baseUrl(): string {
    return this.appConfig.apiBaseUrl;
  }

  async getReport(startDate: string, endDate: string): Promise<SalesReport> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<SalesReport>>(`${this.baseUrl}/api/vendor/sales-report`, {
          params: { startDate, endDate },
        }),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Could not load the sales report.');
      }

      return response.data;
    } catch (error) {
      const backendMessage = (error as { error?: ApiResponse<SalesReport> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Could not load the sales report.'));
    }
  }

  paymentAmount(report: SalesReport, method: string): number {
    return report.paymentMethodBreakdown.find((b) => b.paymentMethod.toLowerCase() === method.toLowerCase())?.amount ?? 0;
  }

  paymentCount(report: SalesReport, method: string): number {
    return report.paymentMethodBreakdown.find((b) => b.paymentMethod.toLowerCase() === method.toLowerCase())?.orderCount ?? 0;
  }
}
