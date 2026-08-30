import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../shared/services/auth/auth.service';
import { Category, CategoriesService } from '../../shared/services/categories/categories.service';
import { Product, ProductsService } from '../../shared/services/products/products.service';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;
  let productsService: { products: ReturnType<typeof vi.fn>; loadAll: ReturnType<typeof vi.fn> };
  let categoriesService: {
    categories: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let authService: { isShopAdmin: ReturnType<typeof vi.fn> };

  const products: Product[] = [
    { id: 1, name: 'Aurora Desk Lamp', category: 'home', price: 1499, taxPercent: 0, description: 'Warm dimmable lamp', stockQuantity: 32 },
    { id: 2, name: 'Terra Canvas Tote', category: 'fashion', price: 1299, taxPercent: 0, description: 'Everyday tote', stockQuantity: 5 },
    { id: 3, name: 'Echo Wireless Speaker', category: 'electronics', price: 3999, taxPercent: 0, description: 'Portable speaker', stockQuantity: 0 },
  ];

  function setup(options: { isShopAdmin?: boolean; categories?: Category[] } = {}) {
    productsService = {
      products: vi.fn(() => products),
      loadAll: vi.fn().mockResolvedValue(undefined),
    };
    categoriesService = {
      categories: vi.fn(() => options.categories ?? []),
      create: vi.fn(),
      remove: vi.fn(),
    };
    authService = { isShopAdmin: vi.fn(() => options.isShopAdmin ?? true) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
        { provide: ProductsService, useValue: productsService },
        { provide: CategoriesService, useValue: categoriesService },
        { provide: AuthService, useValue: authService },
      ],
    });

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads products on init', () => {
    setup();
    expect(productsService.loadAll).toHaveBeenCalled();
  });

  it('renders a card per product', () => {
    setup();
    const cards = fixture.nativeElement.querySelectorAll('.product-card');
    expect(cards.length).toBe(3);
  });

  it('filters products by search query', () => {
    setup();
    component.searchQuery.set('tote');
    fixture.detectChanges();
    expect(component.filteredProducts().map((product) => product.id)).toEqual([2]);
  });

  it('filters products by category', () => {
    setup();
    component.setCategory('electronics');
    fixture.detectChanges();
    expect(component.filteredProducts().map((product) => product.id)).toEqual([3]);
  });

  it('shows only low/out-of-stock products sorted by quantity when toggled', () => {
    setup();
    component.toggleLowStockOnly();
    fixture.detectChanges();
    expect(component.filteredProducts().map((product) => product.id)).toEqual([3, 2]);
  });

  it('computes low-stock and out-of-stock counts', () => {
    setup();
    expect(component.lowStockCount()).toBe(1);
    expect(component.outOfStockCount()).toBe(1);
  });

  it('hides admin-only actions for non-admins', () => {
    setup({ isShopAdmin: false });
    expect(fixture.nativeElement.querySelector('.add-product-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.manage-categories-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.link-button')).toBeNull();
  });

  it('shows admin-only actions for admins', () => {
    setup({ isShopAdmin: true });
    expect(fixture.nativeElement.querySelector('.add-product-button')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.manage-categories-button')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.link-button')).not.toBeNull();
  });

  it('opens and closes the add product modal', () => {
    setup();
    expect(fixture.nativeElement.querySelector('app-product-form')).toBeNull();

    component.openAddModal();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-product-form')).not.toBeNull();

    component.closeAddModal();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-product-form')).toBeNull();
  });

  it('adds a category and clears the input on success', async () => {
    setup();
    categoriesService.create.mockResolvedValue({ id: 9, name: 'New', parentCategoryId: null });

    component.newCategoryName.set('New');
    await component.addCategory();

    expect(categoriesService.create).toHaveBeenCalledWith('New');
    expect(component.newCategoryName()).toBe('');
    expect(component.categoryError()).toBeNull();
  });

  it('sets an error message when creating a category fails', async () => {
    setup();
    categoriesService.create.mockRejectedValue(new Error('Category already exists'));

    component.newCategoryName.set('Bad');
    await component.addCategory();

    expect(component.categoryError()).toBe('Category already exists');
  });

  it('deletes a category', async () => {
    setup();
    categoriesService.remove.mockResolvedValue(undefined);

    await component.deleteCategory(5);

    expect(categoriesService.remove).toHaveBeenCalledWith(5);
  });
});
