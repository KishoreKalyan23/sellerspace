import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  storeName?: string;
  mobile?: string;
  alternateMobile?: string;
  gstNumber?: string;
  buildingNumber?: string;
  streetName?: string;
  district?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

interface AuthResult {
  vendorId: number;
  name: string;
  storeName: string;
  mobile?: string;
  alternateMobile?: string;
  gstNumber?: string;
  buildingNumber?: string;
  streetName?: string;
  district?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:55142';

  readonly currentVendor = signal<Vendor | null>(null);
  readonly jwt = signal<string | null>(null);
  readonly isLoggedIn = computed(() => !!this.jwt() || !!this.currentVendor());

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AuthResult>>(`${this.baseUrl}/api/auth/login`, {
          email,
          password,
        }),
      );

      const payload = response.data;
      if (!payload || !payload.token) {
        return false;
      }

      this.jwt.set(payload.token);
      this.currentVendor.set({
        id: String(payload.vendorId),
        name: payload.name,
        email,
        storeName: payload.storeName,
        mobile: payload.mobile,
        alternateMobile: payload.alternateMobile,
        gstNumber: payload.gstNumber,
        buildingNumber: payload.buildingNumber,
        streetName: payload.streetName,
        district: payload.district,
        state: payload.state,
        country: payload.country,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });

      return true;
    } catch {
      return false;
    }
  }

  async register(input: {
    name: string;
    email: string;
    password: string;
    storeName: string;
    mobile: string;
    alternateMobile: string;
    gstNumber: string;
    buildingNumber: string;
    streetName: string;
    district: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  }): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<AuthResult>>(`${this.baseUrl}/api/auth/register`, {
          name: input.name,
          email: input.email,
          password: input.password,
          storeName: input.storeName,
          mobile: input.mobile,
          alternateMobile: input.alternateMobile,
          gstNumber: input.gstNumber,
          buildingNumber: input.buildingNumber,
          streetName: input.streetName,
          district: input.district,
          state: input.state,
          country: input.country,
          latitude: input.latitude,
          longitude: input.longitude,
        }),
      );

      const payload = response.data;
      if (!payload || !payload.token) {
        return false;
      }

      this.jwt.set(payload.token);
      this.currentVendor.set({
        id: String(payload.vendorId),
        name: payload.name,
        email: input.email,
        storeName: payload.storeName,
        mobile: payload.mobile,
        alternateMobile: payload.alternateMobile,
        gstNumber: payload.gstNumber,
        buildingNumber: payload.buildingNumber,
        streetName: payload.streetName,
        district: payload.district,
        state: payload.state,
        country: payload.country,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });

      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    this.jwt.set(null);
    this.currentVendor.set(null);
  }

  requestPasswordReset(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
