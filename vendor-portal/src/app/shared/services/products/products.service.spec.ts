import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const baseUrl = 'https://localhost:55142';
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);

    httpMock.expectOne(`${baseUrl}/api/categories`).flush({ success: true, data: [] });
    await Promise.resolve();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts with fallback products', () => {
    expect(service.products()).toHaveLength(3);
    expect(service.products().map((product) => product.name)).toContain('Aurora Desk Lamp');
  });

  it('loadAll() maps backend items, preferring categoryName when present', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/products`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [
        {
          id: 5,
          vendorId: 1,
          categoryId: 1,
          name: 'Widget',
          price: 100,
          taxPercent: 5,
          stock: 10,
          imageUrl: null,
          isActive: true,
          categoryName: null,
        },
        {
          id: 6,
          vendorId: 1,
          categoryId: 2,
          name: 'Gadget',
          price: 50,
          stock: 3,
          isActive: true,
          categoryName: 'Custom',
        },
      ],
    });
    await loadPromise;

    expect(service.products()).toEqual([
      {
        id: 5,
        name: 'Widget',
        category: 'electronics',
        price: 100,
        taxPercent: 5,
        description: 'Widget',
        stockQuantity: 10,
        imageUrl: undefined,
      },
      {
        id: 6,
        name: 'Gadget',
        category: 'Custom',
        price: 50,
        taxPercent: 0,
        description: 'Gadget',
        stockQuantity: 3,
        imageUrl: undefined,
      },
    ]);
  });

  it('loadAll() falls back to defaults when the request errors', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/products`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });
    await loadPromise;

    expect(service.products()).toHaveLength(3);
  });

  it('getById() returns the matching product or undefined', () => {
    expect(service.getById(1)?.name).toBe('Aurora Desk Lamp');
    expect(service.getById(999)).toBeUndefined();
  });

  it('save() posts a new product when id is not positive', async () => {
    const savePromise = service.save({
      id: 0,
      name: 'New Product',
      category: 'electronics',
      price: 250,
      taxPercent: 5,
      description: 'A new product',
      stockQuantity: 8,
    });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      categoryId: 1,
      name: 'New Product',
      description: 'A new product',
      price: 250,
      taxPercent: 5,
      stock: 8,
      imageUrl: '',
    });
    req.flush({
      success: true,
      data: {
        id: 99,
        vendorId: 1,
        categoryId: 1,
        name: 'New Product',
        price: 250,
        taxPercent: 5,
        stock: 8,
        isActive: true,
        categoryName: 'electronics',
      },
    });

    const result = await savePromise;

    expect(result.id).toBe(99);
    expect(service.products()).toHaveLength(4);
    expect(service.products()).toContainEqual(result);
  });

  it('save() puts an existing product and replaces it in place', async () => {
    const savePromise = service.save({
      id: 1,
      name: 'Aurora Desk Lamp',
      category: 'home',
      price: 1599,
      taxPercent: 0,
      description: 'Updated description',
      stockQuantity: 30,
    });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/products/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({
      success: true,
      data: {
        id: 1,
        vendorId: 1,
        categoryId: 3,
        name: 'Aurora Desk Lamp',
        price: 1599,
        taxPercent: 0,
        stock: 30,
        isActive: true,
        categoryName: 'home',
      },
    });

    const result = await savePromise;

    expect(service.products()).toHaveLength(3);
    expect(service.products().find((product) => product.id === 1)).toEqual(result);
    expect(result.price).toBe(1599);
  });

  it('save() falls back to a locally constructed product when the API returns no data', async () => {
    const savePromise = service.save({
      id: 1,
      name: 'Aurora Desk Lamp',
      category: 'home',
      price: 1599,
      taxPercent: 0,
      description: 'Updated description',
      stockQuantity: 30,
    });
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/products/1`);
    req.flush({ success: true, data: null });

    const result = await savePromise;

    expect(result.id).toBe(1);
    expect(result.price).toBe(1599);
    expect(service.products().find((product) => product.id === 1)).toEqual(result);
  });

  it('remove() deletes and filters the product out on success', async () => {
    const removePromise = service.remove(1);
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/products/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await expect(removePromise).resolves.toBe(true);
    expect(service.products().some((product) => product.id === 1)).toBe(false);
  });

  it('remove() returns false and keeps the list unchanged on failure', async () => {
    const removePromise = service.remove(1);
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/products/1`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });

    await expect(removePromise).resolves.toBe(false);
    expect(service.products()).toHaveLength(3);
  });

  it('uploadImages() posts a multipart form with the given files', async () => {
    const file = new File(['data'], 'photo.png', { type: 'image/png' });

    const uploadPromise = service.uploadImages(1, [file]);
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/products/1/image`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    req.flush({ success: true, data: null });

    await expect(uploadPromise).resolves.toBeUndefined();
  });
});
