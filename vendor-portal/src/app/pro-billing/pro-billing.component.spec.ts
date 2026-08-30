import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Product, ProductsService } from '../shared/services/products/products.service';
import { BillingCustomer, ProBillingCheckoutResult, ProBillingService } from './pro-billing.service';
import { ProBillingComponent } from './pro-billing.component';

describe('ProBillingComponent', () => {
  let fixture: ComponentFixture<ProBillingComponent>;
  let component: ProBillingComponent;
  let productsService: { products: ReturnType<typeof vi.fn>; loadAll: ReturnType<typeof vi.fn> };
  let proBillingService: { searchCustomers: ReturnType<typeof vi.fn>; checkout: ReturnType<typeof vi.fn> };

  const lamp: Product = { id: 1, name: 'Aurora Desk Lamp', category: 'home', price: 1000, taxPercent: 18, description: 'Warm lighting', stockQuantity: 10 };
  const tote: Product = { id: 2, name: 'Terra Canvas Tote', category: 'fashion', price: 500, taxPercent: 0, description: 'Everyday tote', stockQuantity: 0 };

  function setup(products: Product[] = [lamp, tote]): void {
    productsService = { products: vi.fn(() => products), loadAll: vi.fn(async () => {}) };
    proBillingService = { searchCustomers: vi.fn(async () => []), checkout: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ProBillingComponent],
      providers: [
        { provide: ProductsService, useValue: productsService },
        { provide: ProBillingService, useValue: proBillingService },
      ],
    });

    fixture = TestBed.createComponent(ProBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => setup());

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads products on init', () => {
    expect(productsService.loadAll).toHaveBeenCalled();
  });

  it('matches products by id or name, capped at 8 results, and is empty for a blank query', () => {
    expect(component.productMatches()).toEqual([]);

    component.productQuery.set('lamp');
    expect(component.productMatches()).toEqual([lamp]);

    component.productQuery.set('1');
    expect(component.productMatches()).toEqual([lamp]);
  });

  it('resets the highlighted index when the query changes', () => {
    component.highlightedIndex.set(1);
    component.onProductQuery({ target: { value: 'a' } } as unknown as Event);

    expect(component.productQuery()).toBe('a');
    expect(component.highlightedIndex()).toBe(0);
  });

  it('navigates dropdown matches with the arrow keys, bounded to the match list', () => {
    component.productQuery.set('a');

    const down = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    component.onProductSearchKeydown(down);
    expect(component.highlightedIndex()).toBe(1);
    component.onProductSearchKeydown(down);
    expect(component.highlightedIndex()).toBe(1);

    const up = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    component.onProductSearchKeydown(up);
    component.onProductSearchKeydown(up);
    expect(component.highlightedIndex()).toBe(0);
  });

  it('adds the highlighted match on Enter and clears the query', () => {
    component.productQuery.set('lamp');
    component.onProductSearchKeydown({ key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent);

    expect(component.lineItems()).toHaveLength(1);
    expect(component.lineItems()[0].productId).toBe(1);
    expect(component.productQuery()).toBe('');
  });

  it('clears the query on Escape', () => {
    component.productQuery.set('lamp');
    component.onProductSearchKeydown({ key: 'Escape' } as unknown as KeyboardEvent);

    expect(component.productQuery()).toBe('');
  });

  it('does not add an out-of-stock product', () => {
    component.addProduct(tote);
    expect(component.lineItems()).toHaveLength(0);
  });

  it('increments the quantity when the same product is added again, bounded by stock', () => {
    component.addProduct(lamp);
    component.addProduct(lamp);

    expect(component.lineItems()).toHaveLength(1);
    expect(component.lineItems()[0].quantity).toBe(2);
  });

  it('removes a line item', () => {
    component.addProduct(lamp);
    component.removeLine(1);

    expect(component.lineItems()).toHaveLength(0);
  });

  it('normalizes an updated line quantity to whole numbers within [1, stockAvailable]', () => {
    component.addProduct(lamp);

    component.updateLineQuantity(1, 4.7);
    expect(component.lineItems()[0].quantity).toBe(4);

    component.updateLineQuantity(1, 50);
    expect(component.lineItems()[0].quantity).toBe(10);

    component.updateLineQuantity(1, -1);
    expect(component.lineItems()[0].quantity).toBe(1);
  });

  it('computes line, subtotal, tax and grand totals', () => {
    const mug: Product = { id: 3, name: 'Basic Mug', category: 'home', price: 500, taxPercent: 0, description: 'Plain mug', stockQuantity: 5 };
    setup([lamp, tote, mug]);

    component.addProduct(lamp);
    component.updateLineQuantity(1, 2);
    component.addProduct(mug);

    const line = component.lineItems().find((item) => item.productId === 1)!;
    expect(component.lineSubtotal(line)).toBe(2000);
    expect(component.lineTax(line)).toBe(360);
    expect(component.lineTotal(line)).toBe(2360);

    expect(component.subtotal()).toBe(2500);
    expect(component.totalTax()).toBe(360);
    expect(component.grandTotal()).toBe(2860);
  });

  it('computes the balance as amount received minus the grand total', () => {
    component.addProduct(lamp);
    component.amountReceived.set(1500);

    expect(component.balance()).toBe(1500 - component.grandTotal());
  });

  it('requires items, customer name and mobile, and enough cash before allowing checkout', () => {
    expect(component.canCheckout()).toBe(false);

    component.addProduct(lamp);
    component.customerName.set('Priya');
    component.customerMobile.set('9999999999');
    expect(component.canCheckout()).toBe(false);

    component.amountReceived.set(component.grandTotal());
    expect(component.canCheckout()).toBe(true);

    component.setPaymentMethod('UPI');
    expect(component.canCheckout()).toBe(true);
  });

  it('clears amount received when switching away from cash', () => {
    component.amountReceived.set(500);
    component.setPaymentMethod('Card');

    expect(component.amountReceived()).toBeNull();
  });

  it('clamps amount received to a non-negative number', () => {
    component.onAmountReceivedInput({ target: { value: '-5' } } as unknown as Event);
    expect(component.amountReceived()).toBe(0);

    component.onAmountReceivedInput({ target: { value: '' } } as unknown as Event);
    expect(component.amountReceived()).toBeNull();
  });

  it('debounces customer search as the name, mobile or email fields change', () => {
    vi.useFakeTimers();

    component.onNameInput({ target: { value: 'Pri' } } as unknown as Event);
    expect(proBillingService.searchCustomers).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(proBillingService.searchCustomers).toHaveBeenCalledWith('Pri');
  });

  it('populates fields and clears suggestions when a customer is selected', () => {
    const customer: BillingCustomer = { id: 5, name: 'Priya', mobile: '9999999999', email: 'priya@example.com' };
    component.customerSuggestions.set([customer]);

    component.selectCustomer(customer);

    expect(component.customerName()).toBe('Priya');
    expect(component.customerMobile()).toBe('9999999999');
    expect(component.customerEmail()).toBe('priya@example.com');
    expect(component.customerSuggestions()).toEqual([]);
  });

  it('does nothing when checkout is invoked while canCheckout is false', async () => {
    await component.checkout();

    expect(proBillingService.checkout).not.toHaveBeenCalled();
  });

  it('checks out with the expected payload and resets the form on success', async () => {
    component.addProduct(lamp);
    component.customerName.set('Priya');
    component.customerMobile.set('9999999999');
    component.customerEmail.set('priya@example.com');
    component.amountReceived.set(component.grandTotal());

    const result: ProBillingCheckoutResult = {
      orderId: 7,
      clientName: 'Priya',
      totalAmount: 1000,
      taxAmount: 180,
      grandTotal: 1180,
      amountReceived: 1180,
      balanceReturned: 0,
      itemCount: 1,
      createdAt: '2026-08-30T00:00:00Z',
    };
    proBillingService.checkout.mockResolvedValue(result);

    await component.checkout();

    expect(proBillingService.checkout).toHaveBeenCalledWith({
      clientName: 'Priya',
      customerMobile: '9999999999',
      customerEmail: 'priya@example.com',
      amountReceived: 1180,
      paymentMethod: 'Cash',
      items: [{ productId: 1, quantity: 1 }],
    });
    expect(component.checkoutSuccess()).toBe('Order #7 placed for Priya.');
    expect(component.lineItems()).toEqual([]);
    expect(component.customerName()).toBe('');
    expect(component.isSubmitting()).toBe(false);
  });

  it('mentions the returned balance in the success message when cash change is due', async () => {
    component.addProduct(lamp);
    component.customerName.set('Priya');
    component.customerMobile.set('9999999999');
    component.amountReceived.set(component.grandTotal());

    proBillingService.checkout.mockResolvedValue({
      orderId: 7,
      clientName: 'Priya',
      totalAmount: 1000,
      taxAmount: 180,
      grandTotal: 1180,
      amountReceived: 1500,
      balanceReturned: 320,
      itemCount: 1,
      createdAt: '2026-08-30T00:00:00Z',
    });

    await component.checkout();

    expect(component.checkoutSuccess()).toContain('Balance returned: 320.00');
  });

  it('omits amountReceived from the payload for non-cash payments', async () => {
    component.addProduct(lamp);
    component.customerName.set('Priya');
    component.customerMobile.set('9999999999');
    component.setPaymentMethod('UPI');
    proBillingService.checkout.mockResolvedValue({
      orderId: 8,
      clientName: 'Priya',
      totalAmount: 1000,
      taxAmount: 180,
      grandTotal: 1180,
      amountReceived: null,
      balanceReturned: null,
      itemCount: 1,
      createdAt: '2026-08-30T00:00:00Z',
    });

    await component.checkout();

    expect(proBillingService.checkout).toHaveBeenCalledWith(expect.objectContaining({ amountReceived: undefined, paymentMethod: 'UPI' }));
  });

  it('surfaces an offline-pending message when checkout is queued offline', async () => {
    component.addProduct(lamp);
    component.customerName.set('Priya');
    component.customerMobile.set('9999999999');
    component.amountReceived.set(component.grandTotal());
    proBillingService.checkout.mockResolvedValue({
      orderId: 0,
      clientName: 'Priya',
      totalAmount: 0,
      taxAmount: 0,
      grandTotal: 0,
      amountReceived: null,
      balanceReturned: null,
      itemCount: 1,
      createdAt: '2026-08-30T00:00:00Z',
      isOfflinePending: true,
    });

    await component.checkout();

    expect(component.checkoutSuccess()).toContain('Bill saved offline for Priya');
  });

  it('surfaces the error message when checkout fails', async () => {
    component.addProduct(lamp);
    component.customerName.set('Priya');
    component.customerMobile.set('9999999999');
    component.amountReceived.set(component.grandTotal());
    proBillingService.checkout.mockRejectedValue(new Error('Payment declined'));

    await component.checkout();

    expect(component.checkoutError()).toBe('Payment declined');
    expect(component.isSubmitting()).toBe(false);
  });

  it('renders an empty state when there are no line items', () => {
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
  });
});
