import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

interface UserSettings {
  useProBilling: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:55142';

  async getSettings(): Promise<UserSettings> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<UserSettings>>(`${this.baseUrl}/api/vendor/settings`),
      );
      return response.data ?? { useProBilling: false };
    } catch {
      return { useProBilling: false };
    }
  }

  async setUseProBilling(useProBilling: boolean): Promise<void> {
    await firstValueFrom(
      this.http.put<ApiResponse<UserSettings>>(`${this.baseUrl}/api/vendor/settings`, { useProBilling }),
    );
  }
}
