import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppConfigService } from '../app-config/app-config.service';

export type UserRole = 'SuperAdmin' | 'ShopAdmin' | 'ShopUser';

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
  role: UserRole;
  canAccessBilling?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

interface StoredSession {
  token: string;
  vendor: Vendor;
}

export interface AuthResult {
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
  role: UserRole;
  canAccessBilling?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly appConfig = inject(AppConfigService);
  private get baseUrl(): string {
    return this.appConfig.apiBaseUrl;
  }
  private readonly storageKey = 'vendor-portal.session';

  readonly currentVendor = signal<Vendor | null>(null);
  readonly jwt = signal<string | null>(null);
  readonly isLoggedIn = computed(() => !!this.jwt() || !!this.currentVendor());
  readonly role = computed<UserRole | null>(() => this.currentVendor()?.role ?? null);
  readonly isSuperAdmin = computed(() => this.role() === 'SuperAdmin');
  readonly isShopAdmin = computed(() => this.role() === 'ShopAdmin');
  readonly isShopUser = computed(() => this.role() === 'ShopUser');
  readonly canAccessBilling = computed(() => {
    const vendor = this.currentVendor();
    return vendor?.role !== 'ShopUser' || vendor.canAccessBilling === true;
  });

  constructor() {
    this.restoreSession();
  }

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

      this.applySession(payload, email);
      return true;
    } catch {
      return false;
    }
  }

  applySession(payload: AuthResult, email: string): void {
    const vendor: Vendor = {
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
      role: payload.role,
      canAccessBilling: payload.canAccessBilling,
    };

    this.jwt.set(payload.token);
    this.currentVendor.set(vendor);
    this.persistSession(payload.token, vendor);
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

      this.applySession(payload, input.email);
      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    this.jwt.set(null);
    this.currentVendor.set(null);
    this.clearSession();
  }

  requestPasswordReset(): Promise<boolean> {
    return Promise.resolve(true);
  }

  private restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return;
      }

      const stored = JSON.parse(raw) as StoredSession;
      if (stored?.token && stored?.vendor) {
        this.jwt.set(stored.token);
        this.currentVendor.set(stored.vendor);
      }
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  private persistSession(token: string, vendor: Vendor): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify({ token, vendor }));
  }

  private clearSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(this.storageKey);
  }
}
