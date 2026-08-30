import { isPlatformServer } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const DEFAULT_API_BASE_URL = 'https://localhost:55142';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly platformId = inject(PLATFORM_ID);

  apiBaseUrl = DEFAULT_API_BASE_URL;

  async load(): Promise<void> {
    if (isPlatformServer(this.platformId)) {
      this.apiBaseUrl = process.env['API_BASE_URL'] || DEFAULT_API_BASE_URL;
      return;
    }

    try {
      const response = await fetch('/app-config.json');
      const config = (await response.json()) as { apiBaseUrl?: string };
      if (config.apiBaseUrl) {
        this.apiBaseUrl = config.apiBaseUrl;
      }
    } catch {
      // Keep the default so the app still runs (e.g. plain `ng serve` with no config file).
    }
  }
}
