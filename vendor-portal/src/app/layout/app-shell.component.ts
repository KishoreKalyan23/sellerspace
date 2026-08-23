import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../shared/services/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSidebarCollapsed = signal(false);
  readonly isSettingsOpen = signal(false);
  readonly isLogoutConfirmOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) =>
        this.isSettingsOpen.set(
          event.urlAfterRedirects.startsWith('/settings') || event.urlAfterRedirects.startsWith('/customers'),
        ),
      );
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  toggleSettings(): void {
    this.isSettingsOpen.set(!this.isSettingsOpen());
  }

  requestLogout(): void {
    this.isLogoutConfirmOpen.set(true);
  }

  cancelLogout(): void {
    this.isLogoutConfirmOpen.set(false);
  }

  confirmLogout(): void {
    this.isLogoutConfirmOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
