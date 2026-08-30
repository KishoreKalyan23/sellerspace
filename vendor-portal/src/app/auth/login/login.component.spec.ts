import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../shared/services/auth/auth.service';
import { LoginComponent } from './login.component';

@Component({ selector: 'app-blank', template: '', standalone: true })
class BlankComponent {}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let router: Router;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    isSuperAdmin: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authService = {
      login: vi.fn(),
      isSuperAdmin: vi.fn(() => false),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: BlankComponent },
          { path: 'dashboard', component: BlankComponent },
          { path: 'superadmin/shops', component: BlankComponent },
          { path: 'custom', component: BlankComponent },
        ]),
        { provide: AuthService, useValue: authService },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('renders the login form', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(2);
  });

  it('shows an error and does not call login when fields are empty', async () => {
    await component.submit();

    expect(component.errorMessage).toBe('Invalid email/login ID or password');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('shows an error message when login fails', async () => {
    authService.login.mockResolvedValue(false);
    component.form.controls.email.setValue('vendor@example.com');
    component.form.controls.password.setValue('wrong-password');

    await component.submit();

    expect(authService.login).toHaveBeenCalledWith('vendor@example.com', 'wrong-password');
    expect(component.errorMessage).toBe('Invalid email/login ID or password');
  });

  it('navigates to the dashboard on successful login for non-super-admins', async () => {
    authService.login.mockResolvedValue(true);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    component.form.controls.email.setValue('vendor@example.com');
    component.form.controls.password.setValue('password123');

    await component.submit();

    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to the superadmin shops page for super admins', async () => {
    authService.login.mockResolvedValue(true);
    authService.isSuperAdmin.mockReturnValue(true);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    component.form.controls.email.setValue('admin@example.com');
    component.form.controls.password.setValue('password123');

    await component.submit();

    expect(navigateSpy).toHaveBeenCalledWith('/superadmin/shops');
  });

  it('honors a returnUrl query param over the default redirect', async () => {
    authService.login.mockResolvedValue(true);
    await router.navigateByUrl('/login?returnUrl=%2Fcustom');
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    component.form.controls.email.setValue('vendor@example.com');
    component.form.controls.password.setValue('password123');

    await component.submit();

    expect(navigateSpy).toHaveBeenCalledWith('/custom');
  });
});
