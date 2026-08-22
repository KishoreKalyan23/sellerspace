import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors?: string[];
}

interface BackendCategoryNode {
  id: number;
  name: string;
  parentCategoryId: number | null;
  children: BackendCategoryNode[];
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:55142';

  readonly categories = signal<Category[]>(this.getFallbackCategories());

  constructor() {
    void this.loadAll();
  }

  async loadAll(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<BackendCategoryNode[]>>(`${this.baseUrl}/api/categories`),
      );
      const flat = this.flatten(response.data ?? []);
      this.categories.set(flat.length ? flat : this.getFallbackCategories());
    } catch {
      this.categories.set(this.getFallbackCategories());
    }
  }

  async create(name: string): Promise<Category> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Category>>(`${this.baseUrl}/api/vendor/categories`, { name }),
      );

      if (!response.data) {
        throw new Error(response.errors?.[0] ?? 'Could not create category.');
      }

      this.categories.update((categories) => [...categories, response.data as Category]);
      return response.data;
    } catch (error) {
      throw this.toError(error, 'Could not create category.');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/api/vendor/categories/${id}`));
      this.categories.update((categories) => categories.filter((category) => category.id !== id));
    } catch (error) {
      throw this.toError(error, 'Could not delete category.');
    }
  }

  private toError(error: unknown, fallbackMessage: string): Error {
    const backendMessage = (error as { error?: ApiResponse<unknown> })?.error?.errors?.[0];
    return new Error(backendMessage ?? (error instanceof Error ? error.message : fallbackMessage));
  }

  private flatten(nodes: BackendCategoryNode[]): Category[] {
    const result: Category[] = [];
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name, parentCategoryId: node.parentCategoryId });
      if (node.children?.length) {
        result.push(...this.flatten(node.children));
      }
    }
    return result;
  }

  private getFallbackCategories(): Category[] {
    return [
      { id: 1, name: 'Electronics', parentCategoryId: null },
      { id: 2, name: 'Fashion', parentCategoryId: null },
      { id: 3, name: 'Home', parentCategoryId: null },
    ];
  }
}
