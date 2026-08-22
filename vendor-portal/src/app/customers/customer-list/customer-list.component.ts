import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CustomersService } from '../customers.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, EmptyStateComponent, PageHeaderComponent],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css',
})
export class CustomerListComponent implements OnInit {
  private readonly customersService = inject(CustomersService);

  readonly customers = this.customersService.customers;
  readonly isLoading = signal(true);

  readonly isAddModalOpen = signal(false);
  readonly name = signal('');
  readonly mobile = signal('');
  readonly email = signal('');
  readonly isSaving = signal(false);
  readonly formError = signal<string | null>(null);

  ngOnInit(): void {
    void this.customersService.loadAll().finally(() => this.isLoading.set(false));
  }

  openAddModal(): void {
    this.name.set('');
    this.mobile.set('');
    this.email.set('');
    this.formError.set(null);
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  onMobileInput(event: Event): void {
    this.mobile.set((event.target as HTMLInputElement).value);
  }

  onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  async save(): Promise<void> {
    if (!this.name().trim() || !this.mobile().trim() || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.formError.set(null);

    try {
      await this.customersService.create({
        name: this.name().trim(),
        mobile: this.mobile().trim(),
        email: this.email().trim() || undefined,
      });
      this.isAddModalOpen.set(false);
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'Could not save customer.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
