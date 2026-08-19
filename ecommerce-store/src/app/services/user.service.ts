import { Injectable, signal } from '@angular/core';
import { UserProfile } from '../models/user-profile';
import usersData from '../data/users.json';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly currentUserSignal = signal<UserProfile | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.loadDefaultUser();
  }

  private loadDefaultUser(): void {
    const [user] = usersData as UserProfile[];
    this.currentUserSignal.set(user ?? null);
  }

  updateUser(user: UserProfile): void {
    this.currentUserSignal.set(user);
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSignal();
  }

  getPreferredCategories(): string[] {
    return this.currentUserSignal()?.preferredCategories ?? [];
  }

  getPreferredVendors(): string[] {
    return this.currentUserSignal()?.preferredVendors ?? [];
  }
}
