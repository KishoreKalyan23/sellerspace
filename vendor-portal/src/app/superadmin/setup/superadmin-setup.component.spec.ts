import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../shared/services/auth/auth.service';
import { SuperAdminService } from '../superadmin.service';
import { SuperAdminSetupComponent } from './superadmin-setup.component';

@Component({ selector: 'app-blank', template: '', standalone: true })
class BlankComponent {}

describe('SuperAdminSetupComponent', () => {
  let fixture: ComponentFixture<SuperAdminSetupComponent>;
  let component: SuperAdminSetupComponent;
  let router: Router;
  let superAdminService: { getSetupStatus: ReturnType<typeof vi.fn>; setup: ReturnType<typeof vi.fn> };
  let authService: { applySession: ReturnType<typeof vi.fn> };

  const createFixture = async () => {
    fixture = TestBed.createComponent(SuperAdminSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    superAdminService = {
      getSetupStatus: vi.fn().mockResolvedValue(false),
      setup: vi.fn(),
    };
    authService = { applySession: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: BlankComponent },
          { path: 'superadmin/shops', component: BlankComponent },
        ]),
        { provide: SuperAdminService, useValue: superAdminService },
        { provide: AuthService, useValue: authService },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('redirects to login when setup is already complete', async () => {
    superAdminService.getSetupStatus.mockResolvedValue(true);
    const navigateSpy = vi.spyOn(router, 'navigate');

    await createFixture();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('shows the setup form once the status check completes', async () => {
    await createFixture();

    expect(component.isChecking()).toBe(false);
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('flags a password mismatch', async () => {
    await createFixture();

    component.form.controls.password.setValue('password123');
    component.form.controls.confirmPassword.setValue('different');

    expect(component.passwordMismatch).toBe(true);
  });

  it('does not submit when passwords do not match', async () => {
    await createFixture();

    component.form.controls.name.setValue('Admin');
    component.form.controls.email.setValue('admin@example.com');
    component.form.controls.password.setValue('password123');
    component.form.controls.confirmPassword.setValue('different');

    await component.submit();

    expect(superAdminService.setup).not.toHaveBeenCalled();
  });

  it('creates the super admin and navigates to the shops list on success', async () => {
    await createFixture();
    superAdminService.setup.mockResolvedValue({
      vendorId: 1,
      name: 'Admin',
      role: 'SuperAdmin',
      token: 'jwt-token',
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.form.controls.name.setValue('Admin');
    component.form.controls.email.setValue('admin@example.com');
    component.form.controls.password.setValue('password123');
    component.form.controls.confirmPassword.setValue('password123');

    await component.submit();

    expect(superAdminService.setup).toHaveBeenCalledWith({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
    });
    expect(authService.applySession).toHaveBeenCalledWith(
      { vendorId: 1, name: 'Admin', storeName: '', token: 'jwt-token', role: 'SuperAdmin' },
      'admin@example.com',
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/superadmin/shops']);
  });

  it('shows an error message when setup fails', async () => {
    await createFixture();
    superAdminService.setup.mockRejectedValue(new Error('Email already registered'));

    component.form.controls.name.setValue('Admin');
    component.form.controls.email.setValue('admin@example.com');
    component.form.controls.password.setValue('password123');
    component.form.controls.confirmPassword.setValue('password123');

    await component.submit();

    expect(component.errorMessage()).toBe('Email already registered');
    expect(component.isSaving()).toBe(false);
  });
});
