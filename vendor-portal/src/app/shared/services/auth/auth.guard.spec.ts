import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service';
import { authGuard, billingAccessGuard, homeGuard, roleGuard } from './auth.guard';

describe('auth guards', () => {
  let authService: { isLoggedIn: ReturnType<typeof vi.fn>; role: ReturnType<typeof vi.fn>; isSuperAdmin: ReturnType<typeof vi.fn>; canAccessBilling: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = {
      isLoggedIn: vi.fn(),
      role: vi.fn(),
      isSuperAdmin: vi.fn(),
      canAccessBilling: vi.fn(),
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  describe('authGuard', () => {
    it('allows navigation when logged in', () => {
      authService.isLoggedIn.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as never, { url: '/dashboard' } as never),
      );

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('redirects to login with a returnUrl when not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as never, { url: '/billing' } as never),
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/billing' } });
    });
  });

  describe('roleGuard', () => {
    it('allows navigation when the current role is permitted', () => {
      authService.role.mockReturnValue('ShopAdmin');

      const result = TestBed.runInInjectionContext(() => roleGuard(['ShopAdmin', 'ShopUser'])({} as never, {} as never));

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('redirects to dashboard when the current role is not permitted', () => {
      authService.role.mockReturnValue('ShopUser');

      const result = TestBed.runInInjectionContext(() => roleGuard(['SuperAdmin'])({} as never, {} as never));

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('redirects to dashboard when there is no role', () => {
      authService.role.mockReturnValue(null);

      const result = TestBed.runInInjectionContext(() => roleGuard(['ShopAdmin'])({} as never, {} as never));

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('homeGuard', () => {
    it('redirects super admins to the shops list', () => {
      authService.isSuperAdmin.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => homeGuard({} as never, {} as never));

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/superadmin/shops']);
    });

    it('redirects everyone else to the dashboard', () => {
      authService.isSuperAdmin.mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => homeGuard({} as never, {} as never));

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('billingAccessGuard', () => {
    it('allows navigation when billing access is granted', () => {
      authService.canAccessBilling.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => billingAccessGuard({} as never, {} as never));

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('redirects to dashboard when billing access is denied', () => {
      authService.canAccessBilling.mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => billingAccessGuard({} as never, {} as never));

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});
