import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  const baseUrl = 'https://localhost:55142';
  let service: CategoriesService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoriesService);
    httpMock = TestBed.inject(HttpTestingController);

    httpMock.expectOne(`${baseUrl}/api/categories`).flush({ success: true, data: [] });
    await Promise.resolve();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('falls back to default categories when the initial load returns nothing', () => {
    expect(service.categories()).toHaveLength(3);
    expect(service.categories().map((category) => category.name)).toContain('Electronics');
  });

  it('loadAll() flattens a nested category tree', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${baseUrl}/api/categories`);
    req.flush({
      success: true,
      data: [
        {
          id: 1,
          name: 'Electronics',
          parentCategoryId: null,
          children: [{ id: 2, name: 'Phones', parentCategoryId: 1, children: [] }],
        },
      ],
    });
    await loadPromise;

    expect(service.categories()).toEqual([
      { id: 1, name: 'Electronics', parentCategoryId: null },
      { id: 2, name: 'Phones', parentCategoryId: 1 },
    ]);
  });

  it('loadAll() falls back to defaults when the request errors', async () => {
    const loadPromise = service.loadAll();
    const req = httpMock.expectOne(`${baseUrl}/api/categories`);
    req.flush('boom', { status: 500, statusText: 'Internal Server Error' });
    await loadPromise;

    expect(service.categories()).toHaveLength(3);
  });

  it('create() posts the new category and appends it to the signal', async () => {
    const createPromise = service.create('Books');
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/categories`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Books' });
    req.flush({ success: true, data: { id: 10, name: 'Books', parentCategoryId: null } });

    const result = await createPromise;

    expect(result).toEqual({ id: 10, name: 'Books', parentCategoryId: null });
    expect(service.categories()).toContainEqual({ id: 10, name: 'Books', parentCategoryId: null });
  });

  it('create() throws the backend error message when no data is returned', async () => {
    const createPromise = service.create('Bad');
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/categories`);
    req.flush({ success: false, data: null, errors: ['Name already exists'] });

    await expect(createPromise).rejects.toThrow('Name already exists');
  });

  it('remove() deletes and filters the category out of the signal', async () => {
    const [{ id: firstId }] = service.categories();

    const removePromise = service.remove(firstId);
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/categories/${firstId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await removePromise;

    expect(service.categories().some((category) => category.id === firstId)).toBe(false);
  });

  it('remove() throws the backend error message on failure', async () => {
    const removePromise = service.remove(999);
    const req = httpMock.expectOne(`${baseUrl}/api/vendor/categories/999`);
    req.flush({ success: false, errors: ['Category is in use'] }, { status: 400, statusText: 'Bad Request' });

    await expect(removePromise).rejects.toThrow('Category is in use');
  });
});
