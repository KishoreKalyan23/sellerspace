import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Product, ProductsService } from '../../shared/services/products/products.service';
import { BillingItem, BillingService } from '../billing.service';
import { BillingSummaryComponent } from './billing-summary.component';

describe('BillingSummaryComponent', () => {
  let fixture: ComponentFixture<BillingSummaryComponent>;
  let component: BillingSummaryComponent;
  let billingService: {
    billingItems: ReturnType<typeof vi.fn>;
    subtotal: ReturnType<typeof vi.fn>;
    total: ReturnType<typeof vi.fn>;
    updateQuantity: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    checkout: ReturnType<typeof vi.fn>;
  };
  let productsService: { getById: ReturnType<typeof vi.fn> };

  const item: BillingItem = { productId: 1, name: 'Aurora Desk Lamp', price: 1499, quantity: 2 };

  function setup(items: BillingItem[] = [item]): void {
    billingService = {
      billingItems: vi.fn(() => items),
      subtotal: vi.fn(() => items.reduce((total, current) => total + current.price * current.quantity, 0)),
      total: vi.fn(() => items.reduce((total, current) => total + current.price * current.quantity, 0)),
      updateQuantity: vi.fn(),
      removeItem: vi.fn(),
      checkout: vi.fn(),
    };
    productsService = { getById: vi.fn(() => undefined) };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [BillingSummaryComponent],
      providers: [
        { provide: BillingService, useValue: billingService },
        { provide: ProductsService, useValue: productsService },
      ],
    });

    fixture = TestBed.createComponent(BillingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => setup());

  it('delegates quantity changes and item removal to the billing service', () => {
    component.updateQuantity(1, 3);
    expect(billingService.updateQuantity).toHaveBeenCalledWith(1, 3);

    component.changeQuantity(1, 4);
    expect(billingService.updateQuantity).toHaveBeenCalledWith(1, 4);

    component.removeItem(1);
    expect(billingService.removeItem).toHaveBeenCalledWith(1);
  });

  it('updates the client name and clears any checkout error', () => {
    component.checkoutError.set('Something went wrong');

    component.updateClientName({ target: { value: 'Priya' } } as unknown as Event);

    expect(component.clientName()).toBe('Priya');
    expect(component.checkoutError()).toBeNull();
  });

  it('computes canCheckout only when there are items, a client name, and no in-flight checkout', () => {
    expect(component.canCheckout()).toBe(false);

    component.clientName.set('Priya');
    expect(component.canCheckout()).toBe(true);

    component.clientName.set('   ');
    expect(component.canCheckout()).toBe(false);

    component.clientName.set('Priya');
    component.isCheckingOut.set(true);
    expect(component.canCheckout()).toBe(false);
  });

  it('does nothing when checkout is invoked while canCheckout is false', async () => {
    await component.checkout();

    expect(billingService.checkout).not.toHaveBeenCalled();
  });

  it('checks out successfully and resets the form', async () => {
    billingService.checkout.mockResolvedValue({
      orderId: 42,
      clientName: 'Priya',
      totalAmount: 2998,
      itemCount: 1,
      createdAt: '2026-08-30T00:00:00Z',
    });
    component.clientName.set('Priya');
    component.paymentMethod.set('UPI');

    await component.checkout();

    expect(billingService.checkout).toHaveBeenCalledWith('Priya', 'UPI');
    expect(component.checkoutSuccess()).toBe('Order #42 placed for Priya.');
    expect(component.clientName()).toBe('');
    expect(component.paymentMethod()).toBe('Cash');
    expect(component.isCheckingOut()).toBe(false);
  });

  it('surfaces an offline-pending message when checkout is queued offline', async () => {
    billingService.checkout.mockResolvedValue({
      orderId: 0,
      clientName: 'Priya',
      totalAmount: 2998,
      itemCount: 1,
      createdAt: '2026-08-30T00:00:00Z',
      isOfflinePending: true,
    });
    component.clientName.set('Priya');

    await component.checkout();

    expect(component.checkoutSuccess()).toContain('Bill saved offline for Priya');
  });

  it('surfaces the error message when checkout fails', async () => {
    billingService.checkout.mockRejectedValue(new Error('Out of stock'));
    component.clientName.set('Priya');

    await component.checkout();

    expect(component.checkoutError()).toBe('Out of stock');
    expect(component.checkoutSuccess()).toBeNull();
    expect(component.isCheckingOut()).toBe(false);
  });

  it('builds the product image url when the product has one, and null otherwise', () => {
    productsService.getById.mockReturnValue({ imageUrl: '/images/lamp.png' } as Product);
    expect(component.imageUrl(1)).toBe('https://localhost:55142/images/lamp.png');

    productsService.getById.mockReturnValue({ imageUrl: undefined } as unknown as Product);
    expect(component.imageUrl(1)).toBeNull();

    productsService.getById.mockReturnValue(undefined);
    expect(component.imageUrl(1)).toBeNull();
  });

  it('renders an empty state when there are no billing items', () => {
    setup([]);

    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('0 items');
  });
});
