import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Category, CategoriesService } from '../../shared/services/categories/categories.service';
import { Product, ProductsService } from '../../shared/services/products/products.service';
import { ProductFormComponent } from './product-form.component';

@Component({ selector: 'app-blank', template: '', standalone: true })
class BlankComponent {}

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;
  let productsService: {
    getById: ReturnType<typeof vi.fn>;
    loadAll: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    uploadImages: ReturnType<typeof vi.fn>;
  };
  let categoriesService: { categories: ReturnType<typeof vi.fn> };
  let router: Router;

  const existingProduct: Product = {
    id: 5,
    name: 'Existing Product',
    category: 'home',
    price: 100,
    taxPercent: 5,
    description: 'desc',
    stockQuantity: 10,
  };
  const categories: Category[] = [{ id: 1, name: 'Home', parentCategoryId: null }];
  const validPayload = { name: 'New Product', category: 'home', price: 10, taxPercent: 0, description: 'd', stockQuantity: 3 };

  function setup(paramMap: Record<string, string> = {}) {
    productsService = {
      getById: vi.fn(() => undefined),
      loadAll: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      uploadImages: vi.fn().mockResolvedValue(undefined),
    };
    categoriesService = { categories: vi.fn(() => categories) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'products', component: BlankComponent }]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(paramMap) } } },
        { provide: ProductsService, useValue: productsService },
        { provide: CategoriesService, useValue: categoriesService },
      ],
    });

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
  }

  it('starts in create mode with an invalid empty form', () => {
    setup();
    fixture.detectChanges();

    expect(component.isEditMode).toBe(false);
    expect(component.form.invalid).toBe(true);
  });

  it('patches the form from a product already cached in the service', () => {
    setup({ id: '5' });
    productsService.getById.mockReturnValue(existingProduct);

    fixture.detectChanges();

    expect(component.isEditMode).toBe(true);
    expect(component.productId).toBe(5);
    expect(component.form.value.name).toBe('Existing Product');
    expect(productsService.loadAll).not.toHaveBeenCalled();
  });

  it('loads all products and patches the form when the id is not cached yet', async () => {
    setup({ id: '7' });
    productsService.getById.mockReturnValueOnce(undefined).mockReturnValueOnce({ ...existingProduct, id: 7 });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(productsService.loadAll).toHaveBeenCalled();
    expect(component.isEditMode).toBe(true);
    expect(component.productId).toBe(7);
  });

  it('navigates back to the products list when the id cannot be found after loading', async () => {
    setup({ id: '99' });
    productsService.getById.mockReturnValue(undefined);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('does not save an invalid form and marks all fields as touched', async () => {
    setup();
    fixture.detectChanges();

    await component.submit();

    expect(productsService.save).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('saves a valid form, reloads products, and navigates on success', async () => {
    setup();
    fixture.detectChanges();
    component.form.setValue(validPayload);
    productsService.save.mockResolvedValue({ id: 42, ...validPayload });
    const navigateSpy = vi.spyOn(router, 'navigate');

    await component.submit();

    expect(productsService.save).toHaveBeenCalledWith(expect.objectContaining({ id: 0, name: 'New Product', category: 'home' }));
    expect(productsService.uploadImages).not.toHaveBeenCalled();
    expect(productsService.loadAll).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('uploads any selected images after saving', async () => {
    setup();
    fixture.detectChanges();
    component.form.setValue(validPayload);
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = vi.fn(() => 'blob:mock-url');
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    component.onImageSelected({ target: input } as unknown as Event);
    productsService.save.mockResolvedValue({ id: 3, ...validPayload });

    await component.submit();

    expect(productsService.uploadImages).toHaveBeenCalledWith(3, [file]);
  });

  it('emits saved and does not navigate when embedded', async () => {
    setup();
    component.embedded = true;
    fixture.detectChanges();
    component.form.setValue(validPayload);
    productsService.save.mockResolvedValue({ id: 42, ...validPayload });
    const navigateSpy = vi.spyOn(router, 'navigate');
    const savedSpy = vi.fn();
    component.saved.subscribe(savedSpy);

    await component.submit();

    expect(savedSpy).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('updates the selected images and preview urls when files are chosen', () => {
    setup();
    fixture.detectChanges();
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = vi.fn(() => 'blob:mock-url');
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });

    component.onImageSelected({ target: input } as unknown as Event);

    expect(component.selectedImages).toEqual([file]);
    expect(component.imagePreviewUrls).toEqual(['blob:mock-url']);
  });

  it('emits closed instead of navigating when cancel is called while embedded', () => {
    setup();
    component.embedded = true;
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    component.cancel();

    expect(closedSpy).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('navigates to the products list on cancel when not embedded', () => {
    setup();
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });
});
