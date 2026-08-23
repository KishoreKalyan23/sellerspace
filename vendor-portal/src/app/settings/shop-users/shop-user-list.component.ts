import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ShopUser, ShopUsersService } from './shop-users.service';

@Component({
  selector: 'app-shop-user-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, EmptyStateComponent, PageHeaderComponent],
  templateUrl: './shop-user-list.component.html',
  styleUrl: './shop-user-list.component.css',
})
export class ShopUserListComponent implements OnInit {
  private readonly shopUsersService = inject(ShopUsersService);

  readonly shopUsers = this.shopUsersService.shopUsers;
  readonly isLoading = signal(true);

  readonly isAddModalOpen = signal(false);
  readonly name = signal('');
  readonly loginId = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly canAccessBilling = signal(true);
  readonly isSaving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly resetPasswordUserId = signal<number | null>(null);
  readonly resetPasswordValue = signal('');
  readonly resetPasswordError = signal<string | null>(null);
  readonly isResettingPassword = signal(false);

  ngOnInit(): void {
    void this.shopUsersService.loadAll().finally(() => this.isLoading.set(false));
  }

  openAddModal(): void {
    this.name.set('');
    this.loginId.set('');
    this.email.set('');
    this.password.set('');
    this.canAccessBilling.set(true);
    this.formError.set(null);
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  onLoginIdInput(event: Event): void {
    this.loginId.set((event.target as HTMLInputElement).value);
  }

  onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  toggleCanAccessBilling(): void {
    this.canAccessBilling.update((value) => !value);
  }

  async save(): Promise<void> {
    if (!this.name().trim() || !this.loginId().trim() || this.password().length < 8 || this.isSaving()) {
      this.formError.set('Fill in name, a login ID, and a password of at least 8 characters.');
      return;
    }

    this.isSaving.set(true);
    this.formError.set(null);

    try {
      await this.shopUsersService.create({
        name: this.name().trim(),
        loginId: this.loginId().trim(),
        email: this.email().trim() || undefined,
        password: this.password(),
        canAccessBilling: this.canAccessBilling(),
      });
      this.isAddModalOpen.set(false);
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'Could not create user.');
    } finally {
      this.isSaving.set(false);
    }
  }

  async toggleBillingAccess(user: ShopUser): Promise<void> {
    await this.shopUsersService.update(user.id, {
      name: user.name,
      canAccessBilling: !user.canAccessBilling,
      isActive: user.isActive,
    });
  }

  async toggleActive(user: ShopUser): Promise<void> {
    await this.shopUsersService.update(user.id, {
      name: user.name,
      canAccessBilling: user.canAccessBilling,
      isActive: !user.isActive,
    });
  }

  openResetPasswordModal(user: ShopUser): void {
    this.resetPasswordUserId.set(user.id);
    this.resetPasswordValue.set('');
    this.resetPasswordError.set(null);
  }

  closeResetPasswordModal(): void {
    this.resetPasswordUserId.set(null);
  }

  onResetPasswordInput(event: Event): void {
    this.resetPasswordValue.set((event.target as HTMLInputElement).value);
  }

  async confirmResetPassword(): Promise<void> {
    const userId = this.resetPasswordUserId();
    if (userId === null || this.resetPasswordValue().length < 8 || this.isResettingPassword()) {
      this.resetPasswordError.set('Enter a password of at least 8 characters.');
      return;
    }

    this.isResettingPassword.set(true);
    this.resetPasswordError.set(null);

    try {
      await this.shopUsersService.resetPassword(userId, this.resetPasswordValue());
      this.resetPasswordUserId.set(null);
    } catch (error) {
      this.resetPasswordError.set(error instanceof Error ? error.message : 'Could not reset password.');
    } finally {
      this.isResettingPassword.set(false);
    }
  }
}
