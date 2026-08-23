import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthResult, AuthService } from '../../shared/services/auth/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SuperAdminService } from '../superadmin.service';

@Component({
  selector: 'app-superadmin-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './superadmin-setup.component.html',
  styleUrl: './superadmin-setup.component.css',
})
export class SuperAdminSetupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly superAdminService = inject(SuperAdminService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isChecking = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    try {
      const isSetupComplete = await this.superAdminService.getSetupStatus();
      if (isSetupComplete) {
        this.router.navigate(['/login']);
        return;
      }
    } finally {
      this.isChecking.set(false);
    }
  }

  get passwordMismatch(): boolean {
    const values = this.form.getRawValue();
    return !!(values.confirmPassword && values.password !== values.confirmPassword);
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.passwordMismatch || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const { name, email, password } = this.form.getRawValue();

    try {
      const result = await this.superAdminService.setup({ name: name ?? '', email: email ?? '', password: password ?? '' });
      const authResult: AuthResult = {
        vendorId: result.vendorId,
        name: result.name,
        storeName: '',
        token: result.token,
        role: result.role,
      };
      this.authService.applySession(authResult, email ?? '');
      this.router.navigate(['/superadmin/shops']);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Could not complete setup.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
