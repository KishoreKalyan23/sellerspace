import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BillingCustomer, CustomersService } from '../customers.service';
import { CustomerListComponent } from './customer-list.component';

describe('CustomerListComponent', () => {
  let fixture: ComponentFixture<CustomerListComponent>;
  let component: CustomerListComponent;
  let customersService: {
    customers: ReturnType<typeof vi.fn>;
    loadAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  function setup(customers: BillingCustomer[] = []) {
    customersService = {
      customers: vi.fn(() => customers),
      loadAll: vi.fn().mockResolvedValue(undefined),
      create: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: CustomersService, useValue: customersService }],
    });

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
  }

  it('shows a loading state before customers finish loading', () => {
    setup();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.loading-state')).not.toBeNull();
  });

  it('loads customers on init and clears the loading state once resolved', async () => {
    setup();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(customersService.loadAll).toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.querySelector('.loading-state')).toBeNull();
  });

  it('shows an empty state when there are no customers', async () => {
    setup([]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
  });

  it('renders a row per customer, falling back to a dash for a missing email', async () => {
    setup([
      { id: 1, name: 'Asha', mobile: '9999999999', email: 'asha@example.com' },
      { id: 2, name: 'Ravi', mobile: '8888888888', email: null },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.customer-table tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[1].textContent).toContain('—');
  });

  it('resets the form fields and opens the add-customer modal', () => {
    setup();
    fixture.detectChanges();
    component.name.set('stale');

    component.openAddModal();

    expect(component.name()).toBe('');
    expect(component.isAddModalOpen()).toBe(true);
  });

  it('does not save when the name or mobile is blank', async () => {
    setup();
    fixture.detectChanges();
    component.mobile.set('9999999999');

    await component.save();

    expect(customersService.create).not.toHaveBeenCalled();
  });

  it('saves a new customer with trimmed values and closes the modal', async () => {
    setup();
    fixture.detectChanges();
    customersService.create.mockResolvedValue({ id: 3, name: 'Asha', mobile: '9999999999', email: null });
    component.name.set('  Asha  ');
    component.mobile.set(' 9999999999 ');
    component.email.set('   ');
    component.isAddModalOpen.set(true);

    await component.save();

    expect(customersService.create).toHaveBeenCalledWith({ name: 'Asha', mobile: '9999999999', email: undefined });
    expect(component.isAddModalOpen()).toBe(false);
  });

  it('sets an error message and keeps the modal open when saving fails', async () => {
    setup();
    fixture.detectChanges();
    customersService.create.mockRejectedValue(new Error('Mobile already exists'));
    component.name.set('Asha');
    component.mobile.set('9999999999');
    component.isAddModalOpen.set(true);

    await component.save();

    expect(component.formError()).toBe('Mobile already exists');
    expect(component.isAddModalOpen()).toBe(true);
  });
});
