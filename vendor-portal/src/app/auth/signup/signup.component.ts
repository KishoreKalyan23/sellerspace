import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../shared/services/auth/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required]],
    alternateMobile: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    storeName: ['', [Validators.required]],
    gstNumber: ['', [Validators.required, Validators.pattern(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/)]],
    buildingNumber: ['', [Validators.required]],
    streetName: ['', [Validators.required]],
    district: ['', [Validators.required]],
    state: ['', [Validators.required]],
    country: ['', [Validators.required]],
    latitude: [0, [Validators.required]],
    longitude: [0, [Validators.required]],
  });

  currentStep = 0;
  readonly steps = ['Account', 'Store details', 'Address & location'];

  get stepOneValid(): boolean {
    const values = this.form.getRawValue();
    return !!(
      values.name &&
      values.email &&
      values.mobile &&
      values.password &&
      values.confirmPassword &&
      values.password === values.confirmPassword
    );
  }

  get stepTwoValid(): boolean {
    const values = this.form.getRawValue();
    return !!(values.storeName && values.gstNumber && this.form.controls.gstNumber.valid);
  }

  get stepThreeValid(): boolean {
    const values = this.form.getRawValue();
    return !!(
      values.buildingNumber &&
      values.streetName &&
      values.district &&
      values.state &&
      values.country
    );
  }

  next(): void {
    if (this.currentStep === 0 && !this.stepOneValid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.currentStep === 1 && !this.stepTwoValid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep += 1;
    }
  }

  previous(): void {
    if (this.currentStep > 0) {
      this.currentStep -= 1;
    }
  }

  async submit(): Promise<void> {
    if (!this.stepThreeValid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const registered = await this.authService.register({
      name: values.name ?? '',
      email: values.email ?? '',
      password: values.password ?? '',
      storeName: values.storeName ?? '',
      mobile: values.mobile ?? '',
      alternateMobile: values.alternateMobile ?? '',
      gstNumber: values.gstNumber ?? '',
      buildingNumber: values.buildingNumber ?? '',
      streetName: values.streetName ?? '',
      district: values.district ?? '',
      state: values.state ?? '',
      country: values.country ?? '',
      latitude: Number(values.latitude ?? 0),
      longitude: Number(values.longitude ?? 0),
    });

    if (registered) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.form.markAllAsTouched();
  }
}
