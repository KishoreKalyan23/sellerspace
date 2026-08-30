import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Product, ProductsService } from '../../shared/services/products/products.service';
import { BillingItem, BillingService } from '../billing.service';
import { ProductCatalogComponent } from './product-catalog.component';

describe('ProductCatalogComponent', () => {
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let component: ProductCatalogComponent;
  let productsService: { products: ReturnType<typeof vi.fn>; loadAll: ReturnType<typeof vi.fn> };
  let billingService: { billingItems: ReturnType<typeof vi.fn>; addItem: ReturnType<typeof vi.fn> };

  const lamp: Product = { id: 1, name: 'Aurora Desk Lamp', category: 'home', price: 1499, taxPercent: 0, description: 'Warm lighting', stockQuantity: 10 };
  const tote: Product = { id: 2, name: 'Terra Canvas Tote', category: 'fashion', price: 1299, taxPercent: 0, description: 'Everyday tote', stockQuantity: 0 };

  function setup(products: Product[] = [lamp, tote], cartItems: BillingItem[] = []): void {
    productsService = { products: vi.fn(() => products), loadAll: vi.fn(async () => {}) };
    billingService = { billingItems: vi.fn(() => cartItems), addItem: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ProductCatalogComponent],
      providers: [
        { provide: ProductsService, useValue: productsService },
        { provide: BillingService, useValue: billingService },
      ],
    });

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => setup());

  it('loads products on init', () => {
    expect(productsService.loadAll).toHaveBeenCalled();
  });

  it('derives a sorted, de-duplicated list of categories from the products', () => {
    setup([lamp, tote, { ...lamp, id: 3, category: 'home' }]);

    expect(component.categories()).toEqual(['fashion', 'home']);
  });

  it('filters products by category and search query', () => {
    component.setCategory('fashion');
    expect(component.filteredProducts()).toEqual([tote]);

    component.setCategory('all');
    component.searchQuery.set('lamp');
    expect(component.filteredProducts()).toEqual([lamp]);

    component.searchQuery.set('nonexistent');
    expect(component.filteredProducts()).toEqual([]);
  });

  it('updates the search query from an input event', () => {
    component.updateSearch({ target: { value: 'tote' } } as unknown as Event);
    expect(component.searchQuery()).toBe('tote');
  });

  it('sets the card size', () => {
    component.setCardSize('large');
    expect(component.cardSize()).toBe('large');
  });

  it('computes available stock net of what is already in the cart', () => {
    setup([lamp, tote], [{ productId: 1, name: lamp.name, price: lamp.price, quantity: 4 }]);

    expect(component.availableStock(lamp)).toBe(6);
    expect(component.availableStock(tote)).toBe(0);
  });

  it('defaults the requested quantity to 1 when stock is available, and 0 when out of stock', () => {
    expect(component.quantityFor(lamp)).toBe(1);
    expect(component.quantityFor(tote)).toBe(0);
  });

  it('clamps a stored quantity to the available stock', () => {
    setup([lamp, tote], [{ productId: 1, name: lamp.name, price: lamp.price, quantity: 9 }]);

    component.updateQuantity(lamp, 5);
    expect(component.quantityFor(lamp)).toBe(1);
  });

  it('normalizes updated quantities to whole numbers within [1, availableStock]', () => {
    component.updateQuantity(lamp, 3.9);
    expect(component.quantityFor(lamp)).toBe(3);

    component.updateQuantity(lamp, 50);
    expect(component.quantityFor(lamp)).toBe(10);

    component.updateQuantity(lamp, -2);
    expect(component.quantityFor(lamp)).toBe(1);
  });

  it('sets the requested quantity to 0 for an out-of-stock product', () => {
    component.updateQuantity(tote, 3);
    expect(component.quantityFor(tote)).toBe(0);
  });

  it('adds the product to the bill with the currently selected quantity', () => {
    component.updateQuantity(lamp, 3);

    component.addToBill(lamp);

    expect(billingService.addItem).toHaveBeenCalledWith({ productId: 1, name: 'Aurora Desk Lamp', price: 1499, quantity: 3 });
  });

  it('does not add an out-of-stock product to the bill', () => {
    component.addToBill(tote);

    expect(billingService.addItem).not.toHaveBeenCalled();
  });

  it('builds the product image url when present, and null otherwise', () => {
    expect(component.imageUrl({ ...lamp, imageUrl: '/images/lamp.png' })).toBe('https://localhost:55142/images/lamp.png');
    expect(component.imageUrl(lamp)).toBeNull();
  });

  it('renders an empty state when no products match the filters', () => {
    component.searchQuery.set('nonexistent');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
  });
});
