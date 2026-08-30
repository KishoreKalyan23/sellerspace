import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../shared/services/auth/auth.service';
import { SignupComponent } from './signup.component';

@Component({ selector: 'app-blank', template: '', standalone: true })
class BlankComponent {}

describe('SignupComponent', () => {
  let fixture: ComponentFixture<SignupComponent>;
  let component: SignupComponent;
  let router: Router;
  let authService: { register: ReturnType<typeof vi.fn> };

  const fillStepOne = () => {
    component.form.setValue({
      name: 'Jane Vendor',
      email: 'jane@example.com',
      mobile: '9876543210',
      alternateMobile: '',
      password: 'password123',
      confirmPassword: 'password123',
      storeName: '',
      gstNumber: '',
      buildingNumber: '',
      streetName: '',
      district: '',
      state: '',
      country: '',
      latitude: 0,
      longitude: 0,
    });
  };

  const fillStepTwo = () => {
    component.form.controls.storeName.setValue('Jane Store');
    component.form.controls.gstNumber.setValue('22AAAAA0000A1Z5');
  };

  const fillStepThree = () => {
    component.form.controls.buildingNumber.setValue('12');
    component.form.controls.streetName.setValue('Main St');
    component.form.controls.district.setValue('District');
    component.form.controls.state.setValue('State');
    component.form.controls.country.setValue('Country');
  };

  beforeEach(() => {
    authService = { register: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'dashboard', component: BlankComponent }]),
        { provide: AuthService, useValue: authService },
      ],
    });

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('starts on the first step', () => {
    expect(component.currentStep).toBe(0);
    const activeStepLabel = fixture.nativeElement.querySelector('.step.active small').textContent;
    expect(activeStepLabel).toBe('Account');
  });

  it('does not advance to the next step while step one is invalid', () => {
    component.next();
    expect(component.currentStep).toBe(0);
  });

  it('flags a password mismatch', () => {
    component.form.controls.password.setValue('password123');
    component.form.controls.confirmPassword.setValue('different');

    expect(component.passwordMismatch).toBe(true);
  });

  it('advances through the steps once each step is valid', () => {
    fillStepOne();
    component.next();
    expect(component.currentStep).toBe(1);

    fillStepTwo();
    component.next();
    expect(component.currentStep).toBe(2);
  });

  it('moves back a step with previous()', () => {
    fillStepOne();
    component.next();
    component.previous();

    expect(component.currentStep).toBe(0);
  });

  it('registers and navigates to the dashboard on success', async () => {
    authService.register.mockResolvedValue(true);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fillStepOne();
    component.next();
    fillStepTwo();
    component.next();
    fillStepThree();

    await component.submit();

    expect(authService.register).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Vendor',
        email: 'jane@example.com',
        storeName: 'Jane Store',
        gstNumber: '22AAAAA0000A1Z5',
        buildingNumber: '12',
      }),
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('does not navigate when registration fails', async () => {
    authService.register.mockResolvedValue(false);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fillStepOne();
    component.next();
    fillStepTwo();
    component.next();
    fillStepThree();

    await component.submit();

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
