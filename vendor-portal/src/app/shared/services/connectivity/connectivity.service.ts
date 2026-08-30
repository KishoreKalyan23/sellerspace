import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isOnline = signal(true);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isOnline.set(navigator.onLine);
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }
}
