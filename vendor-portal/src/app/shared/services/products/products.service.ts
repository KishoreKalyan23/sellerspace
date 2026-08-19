import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  stockQuantity: number;
  imageUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

interface BackendProductItem {
  id: number;
  vendorId: number;
  categoryId: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  vendorName?: string | null;
  categoryName?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:55142';

  readonly products = signal<Product[]>(this.getFallbackProducts());

  async loadAll(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<BackendProductItem[]>>(`${this.baseUrl}/api/vendor/products`),
      );

      this.products.set((response.data ?? []).map(this.mapBackendProduct));
    } catch {
      this.products.set(this.getFallbackProducts());
    }
  }

  getById(id: number): Product | undefined {
    return this.products().find((product) => product.id === id);
  }

  async save(product: Product): Promise<Product> {
    const payload = {
      categoryId: this.resolveCategoryId(product.category),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stockQuantity,
      imageUrl: '',
    };

    if (product.id > 0) {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<BackendProductItem>>(`${this.baseUrl}/api/vendor/products/${product.id}`, payload),
      );
      const saved: Product = response.data
        ? this.mapBackendProduct(response.data)
        : this.mapBackendProduct({
            id: product.id,
            vendorId: 0,
            categoryId: payload.categoryId,
            name: payload.name,
            price: payload.price,
            stock: payload.stock,
            isActive: true,
            categoryName: product.category,
          });

      const current = this.products();
      const next = current.map((item) => (item.id === saved.id ? saved : item));
      this.products.set(next.length ? next : [saved]);
      return saved;
    }

    const response = await firstValueFrom(
      this.http.post<ApiResponse<BackendProductItem>>(`${this.baseUrl}/api/vendor/products`, payload),
    );

    const saved: Product = response.data
      ? this.mapBackendProduct(response.data)
      : this.mapBackendProduct({
          id: Date.now(),
          vendorId: 0,
          categoryId: payload.categoryId,
          name: payload.name,
          price: payload.price,
          stock: payload.stock,
          isActive: true,
          categoryName: product.category,
        });

    this.products.set([...this.products(), saved]);
    return saved;
  }

  async remove(id: number): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/api/vendor/products/${id}`));
      this.products.set(this.products().filter((product) => product.id !== id));
      return true;
    } catch {
      return false;
    }
  }

  async uploadImages(productId: number, images: File[]): Promise<void> {
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));

    await firstValueFrom(
      this.http.post<ApiResponse<BackendProductItem>>(`${this.baseUrl}/api/vendor/products/${productId}/image`, formData),
    );
  }

  private mapBackendProduct = (item: BackendProductItem): Product => ({
    id: item.id,
    name: item.name,
    category: item.categoryName ?? this.resolveCategoryName(item.categoryId),
    price: Number(item.price ?? 0),
    description: item.name,
    stockQuantity: item.stock ?? 0,
    imageUrl: item.imageUrl ?? undefined,
  });

  private resolveCategoryId(category: string): number {
    const normalized = category.toLowerCase();
    const map: Record<string, number> = {
      electronics: 1,
      fashion: 2,
      home: 3,
    };
    return map[normalized] ?? 1;
  }

  private resolveCategoryName(categoryId: number): string {
    const map: Record<number, string> = {
      1: 'electronics',
      2: 'fashion',
      3: 'home',
    };
    return map[categoryId] ?? 'general';
  }

  private getFallbackProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Aurora Desk Lamp',
        category: 'home',
        price: 1499,
        description: 'Minimal task lamp with warm dimmable LED lighting.',
        stockQuantity: 32,
      },
      {
        id: 2,
        name: 'Terra Canvas Tote',
        category: 'fashion',
        price: 1299,
        description: 'Everyday tote designed for commuting and travel.',
        stockQuantity: 22,
      },
      {
        id: 3,
        name: 'Echo Wireless Speaker',
        category: 'electronics',
        price: 3999,
        description: 'Portable speaker with deep bass and all-day battery life.',
        stockQuantity: 18,
      },
    ];
  }
}
