import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../shared/services/auth/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let component: ForgotPasswordComponent;
  let authService: { requestPasswordReset: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { requestPasswordReset: vi.fn() };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    });

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not submit when the email is invalid', async () => {
    component.form.controls.email.setValue('not-an-email');

    await component.submit();

    expect(authService.requestPasswordReset).not.toHaveBeenCalled();
    expect(component.submitted).toBe(false);
  });

  it('shows the success message once the reset link is sent', async () => {
    authService.requestPasswordReset.mockResolvedValue(true);
    component.form.controls.email.setValue('vendor@example.com');

    await component.submit();
    fixture.detectChanges();

    expect(component.submitted).toBe(true);
    expect(fixture.nativeElement.querySelector('.success-box')).toBeTruthy();
  });

  it('shows an error message when the request fails', async () => {
    authService.requestPasswordReset.mockResolvedValue(false);
    component.form.controls.email.setValue('vendor@example.com');

    await component.submit();

    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBe('Something went wrong sending the reset link. Please try again.');
  });
});
