import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  const returnUrl = state.url;
  router.navigate(['/login'], { queryParams: { returnUrl } });
  return false;
};

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const role = authService.role();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
}

export const homeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  router.navigate([authService.isSuperAdmin() ? '/superadmin/shops' : '/dashboard']);
  return false;
};

export const billingAccessGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.canAccessBilling()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
