import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../shared/services/auth/auth.service';
import { AppShellComponent } from './app-shell.component';

@Component({ selector: 'app-blank', template: '', standalone: true })
class BlankComponent {}

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let component: AppShellComponent;
  let router: Router;
  let authService: {
    isSuperAdmin: ReturnType<typeof vi.fn>;
    isShopAdmin: ReturnType<typeof vi.fn>;
    canAccessBilling: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authService = {
      isSuperAdmin: vi.fn(() => false),
      isShopAdmin: vi.fn(() => true),
      canAccessBilling: vi.fn(() => true),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', component: BlankComponent },
          { path: 'settings/vendor-details', component: BlankComponent },
          { path: 'customers', component: BlankComponent },
        ]),
        { provide: AuthService, useValue: authService },
      ],
    });

    fixture = TestBed.createComponent(AppShellComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('toggles the sidebar collapsed state', () => {
    expect(component.isSidebarCollapsed()).toBe(false);
    component.toggleSidebar();
    expect(component.isSidebarCollapsed()).toBe(true);
  });

  it('opens and closes the settings section manually', () => {
    expect(component.isSettingsOpen()).toBe(false);
    component.toggleSettings();
    expect(component.isSettingsOpen()).toBe(true);
    component.toggleSettings();
    expect(component.isSettingsOpen()).toBe(false);
  });

  it('opens the settings section automatically on settings/customers routes', async () => {
    await router.navigateByUrl('/settings/vendor-details');
    expect(component.isSettingsOpen()).toBe(true);

    await router.navigateByUrl('/dashboard');
    expect(component.isSettingsOpen()).toBe(false);

    await router.navigateByUrl('/customers');
    expect(component.isSettingsOpen()).toBe(true);
  });

  it('shows a confirmation modal before logging out and can be cancelled', () => {
    expect(component.isLogoutConfirmOpen()).toBe(false);

    component.requestLogout();
    expect(component.isLogoutConfirmOpen()).toBe(true);

    component.cancelLogout();
    expect(component.isLogoutConfirmOpen()).toBe(false);
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('logs out and navigates to login on confirm', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.requestLogout();
    component.confirmLogout();

    expect(component.isLogoutConfirmOpen()).toBe(false);
    expect(authService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
