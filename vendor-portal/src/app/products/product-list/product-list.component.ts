import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product, ProductsService } from '../../shared/services/products/products.service';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { ProductFormComponent } from '../product-form/product-form.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

export type ProductCardSize = 'compact' | 'comfortable' | 'large';

const CATEGORIES_MODAL_SCROLL_ID = 'categories-modal-scroll';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductFormComponent, EmptyStateComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  readonly categoriesModalScrollId = CATEGORIES_MODAL_SCROLL_ID;

  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly apiBaseUrl = 'https://localhost:55142';

  readonly isAddModalOpen = signal(false);
  readonly cardSize = signal<ProductCardSize>('compact');
  readonly showLowStockOnly = signal(false);

  readonly manageableCategories = this.categoriesService.categories;
  readonly isCategoriesModalOpen = signal(false);
  readonly newCategoryName = signal('');
  readonly categoryError = signal<string | null>(null);
  readonly isSavingCategory = signal(false);

  readonly products = this.productsService.products;
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('all');
  readonly categories = computed(() => Array.from(new Set(this.products().map((product) => product.category))).sort());
  readonly lowStockCount = computed(
    () => this.products().filter((product) => product.stockQuantity > 0 && product.stockQuantity < 10).length,
  );
  readonly outOfStockCount = computed(() => this.products().filter((product) => product.stockQuantity === 0).length);

  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();
    const lowStockOnly = this.showLowStockOnly();

    const filtered = this.products().filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesQuery =
        !query || [product.name, product.category, product.description].some((value) => value.toLowerCase().includes(query));
      const matchesStock = !lowStockOnly || product.stockQuantity < 10;
      return matchesCategory && matchesQuery && matchesStock;
    });

    return lowStockOnly ? [...filtered].sort((a, b) => a.stockQuantity - b.stockQuantity) : filtered;
  });
  readonly totalInventory = computed(() =>
    this.filteredProducts().reduce((total, product) => total + Number(product.stockQuantity ?? 0), 0),
  );

  ngOnInit(): void {
    void this.productsService.loadAll();
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  imageUrl(product: Product): string | null {
    return product.imageUrl ? `${this.apiBaseUrl}${product.imageUrl}` : null;
  }

  updateSearchQuery(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  setCardSize(size: ProductCardSize): void {
    this.cardSize.set(size);
  }

  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  toggleLowStockOnly(): void {
    this.showLowStockOnly.update((value) => !value);
  }

  openCategoriesModal(): void {
    this.categoryError.set(null);
    this.newCategoryName.set('');
    this.isCategoriesModalOpen.set(true);
  }

  closeCategoriesModal(): void {
    this.isCategoriesModalOpen.set(false);
  }

  onNewCategoryNameInput(event: Event): void {
    this.newCategoryName.set((event.target as HTMLInputElement).value);
    this.categoryError.set(null);
  }

  async addCategory(): Promise<void> {
    const name = this.newCategoryName().trim();
    if (!name || this.isSavingCategory()) {
      return;
    }

    this.isSavingCategory.set(true);
    this.categoryError.set(null);

    try {
      await this.categoriesService.create(name);
      this.newCategoryName.set('');
      this.scrollCategoriesToBottom();
    } catch (error) {
      this.categoryError.set(error instanceof Error ? error.message : 'Could not create category.');
    } finally {
      this.isSavingCategory.set(false);
    }
  }

  async deleteCategory(id: number): Promise<void> {
    this.categoryError.set(null);
    try {
      await this.categoriesService.remove(id);
    } catch (error) {
      this.categoryError.set(error instanceof Error ? error.message : 'Could not delete category.');
    }
  }

  private scrollCategoriesToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById(CATEGORIES_MODAL_SCROLL_ID);
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }
}
