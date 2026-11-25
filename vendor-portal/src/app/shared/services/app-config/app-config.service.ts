import { isPlatformServer } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly platformId = inject(PLATFORM_ID);

  // Build-time default from src/environments; optionally overridden at runtime below.
  apiBaseUrl = environment.apiBaseUrl;

  async load(): Promise<void> {
    if (isPlatformServer(this.platformId)) {
      this.apiBaseUrl = process.env['API_BASE_URL'] || environment.apiBaseUrl;
      return;
    }

    try {
      // Written by docker-entrypoint.sh from $API_BASE_URL; an empty {} keeps the environment value.
      const response = await fetch('/app-config.json');
      const config = (await response.json()) as { apiBaseUrl?: string };
      if (config.apiBaseUrl) {
        this.apiBaseUrl = config.apiBaseUrl;
      }
    } catch {
      // Keep the environment value so the app still runs without a config file.
    }
  }
}
