import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ShopUser {
  id: number;
  name: string;
  loginId: string;
  email: string | null;
  canAccessBilling: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateShopUserPayload {
  name: string;
  loginId: string;
  email?: string;
  password: string;
  canAccessBilling: boolean;
}

export interface UpdateShopUserPayload {
  name: string;
  canAccessBilling: boolean;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ShopUsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:55142';

  readonly shopUsers = signal<ShopUser[]>([]);

  async loadAll(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<ShopUser[]>>(`${this.baseUrl}/api/vendor/shop-users`),
      );
      this.shopUsers.set(response.data ?? []);
    } catch {
      this.shopUsers.set([]);
    }
  }

  async create(payload: CreateShopUserPayload): Promise<ShopUser> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<ShopUser>>(`${this.baseUrl}/api/vendor/shop-users`, payload),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Could not create user.');
      }

      this.shopUsers.update((users) => [response.data as ShopUser, ...users]);
      return response.data;
    } catch (error) {
      const backendMessage = (error as { error?: ApiResponse<ShopUser> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Could not create user.'));
    }
  }

  async update(id: number, payload: UpdateShopUserPayload): Promise<ShopUser> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<ShopUser>>(`${this.baseUrl}/api/vendor/shop-users/${id}`, payload),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Could not update user.');
      }

      this.shopUsers.update((users) => users.map((user) => (user.id === id ? (response.data as ShopUser) : user)));
      return response.data;
    } catch (error) {
      const backendMessage = (error as { error?: ApiResponse<ShopUser> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Could not update user.'));
    }
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put<ApiResponse<object>>(`${this.baseUrl}/api/vendor/shop-users/${id}/reset-password`, { newPassword }),
      );
    } catch (error) {
      const backendMessage = (error as { error?: ApiResponse<object> })?.error?.errors?.[0];
      throw new Error(backendMessage ?? (error instanceof Error ? error.message : 'Could not reset password.'));
    }
  }
}
