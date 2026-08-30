import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ShopUser, ShopUsersService } from './shop-users.service';
import { ShopUserListComponent } from './shop-user-list.component';

describe('ShopUserListComponent', () => {
  let fixture: ComponentFixture<ShopUserListComponent>;
  let component: ShopUserListComponent;
  let shopUsersService: {
    shopUsers: ReturnType<typeof vi.fn>;
    loadAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
  };

  const users: ShopUser[] = [
    {
      id: 1,
      name: 'Amit',
      loginId: 'amit01',
      email: 'amit@example.com',
      canAccessBilling: true,
      isActive: true,
      createdAt: '2026-01-01',
    },
  ];

  beforeEach(() => {
    shopUsersService = {
      shopUsers: vi.fn(() => users),
      loadAll: vi.fn(() => Promise.resolve()),
      create: vi.fn(() => Promise.resolve(users[0])),
      update: vi.fn(() => Promise.resolve(users[0])),
      resetPassword: vi.fn(() => Promise.resolve()),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ShopUsersService, useValue: shopUsersService }],
    });

    fixture = TestBed.createComponent(ShopUserListComponent);
    component = fixture.componentInstance;
  });

  it('loads shop users on init and clears loading state', async () => {
    fixture.detectChanges();
    expect(shopUsersService.loadAll).toHaveBeenCalled();
    await fixture.whenStable();

    expect(component.isLoading()).toBe(false);
  });

  it('renders the loaded users in the table', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Amit');
    expect(text).toContain('amit01');
  });

  it('shows an empty state when there are no shop users', async () => {
    shopUsersService.shopUsers.mockReturnValue([]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No shop users yet.');
  });

  it('rejects an invalid form and does not call create', async () => {
    component.name.set('');
    await component.save();

    expect(component.formError()).toBeTruthy();
    expect(shopUsersService.create).not.toHaveBeenCalled();
  });

  it('creates a shop user with the entered form values', async () => {
    component.name.set('New User');
    component.loginId.set('newuser');
    component.email.set('new@example.com');
    component.password.set('password123');
    component.canAccessBilling.set(false);

    await component.save();

    expect(shopUsersService.create).toHaveBeenCalledWith({
      name: 'New User',
      loginId: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      canAccessBilling: false,
    });
    expect(component.isAddModalOpen()).toBe(false);
  });

  it('surfaces a create error without closing the modal', async () => {
    shopUsersService.create = vi.fn(() => Promise.reject(new Error('Login ID taken')));
    component.openAddModal();
    component.name.set('New User');
    component.loginId.set('newuser');
    component.password.set('password123');

    await component.save();

    expect(component.formError()).toBe('Login ID taken');
    expect(component.isAddModalOpen()).toBe(true);
  });

  it('toggles billing access for a user', async () => {
    await component.toggleBillingAccess(users[0]);

    expect(shopUsersService.update).toHaveBeenCalledWith(1, {
      name: 'Amit',
      canAccessBilling: false,
      isActive: true,
    });
  });

  it('toggles active status for a user', async () => {
    await component.toggleActive(users[0]);

    expect(shopUsersService.update).toHaveBeenCalledWith(1, {
      name: 'Amit',
      canAccessBilling: true,
      isActive: false,
    });
  });

  it('resets a password when the new value is valid', async () => {
    component.openResetPasswordModal(users[0]);
    component.resetPasswordValue.set('newpassword');

    await component.confirmResetPassword();

    expect(shopUsersService.resetPassword).toHaveBeenCalledWith(1, 'newpassword');
    expect(component.resetPasswordUserId()).toBeNull();
  });

  it('rejects a too-short reset password', async () => {
    component.openResetPasswordModal(users[0]);
    component.resetPasswordValue.set('short');

    await component.confirmResetPassword();

    expect(shopUsersService.resetPassword).not.toHaveBeenCalled();
    expect(component.resetPasswordError()).toBeTruthy();
  });
});
