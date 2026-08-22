import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface BillingCustomer {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
}

export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  email?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:55142';

  readonly customers = signal<BillingCustomer[]>([]);

  async loadAll(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<BillingCustomer[]>>(`${this.baseUrl}/api/vendor/customers`),
      );
      this.customers.set(response.data ?? []);
    } catch {
      this.customers.set([]);
    }
  }

  async create(payload: CreateCustomerPayload): Promise<BillingCustomer> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<BillingCustomer>>(`${this.baseUrl}/api/vendor/customers`, payload),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Could not save customer.');
      }

      this.customers.update((customers) => [response.data as BillingCustomer, ...customers]);
      return response.data;
    } catch (error) {
      const backendMessage = (error as { error?: ApiResponse<BillingCustomer> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Could not save customer.'));
    }
  }
}
