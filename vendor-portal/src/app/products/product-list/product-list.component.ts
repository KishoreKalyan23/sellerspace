import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product, ProductsService } from '../../shared/services/products/products.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly apiBaseUrl = 'https://localhost:55142';

  readonly products = this.productsService.products;
  readonly searchQuery = signal('');
  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.products();
    }

    return this.products().filter((product) =>
      [product.name, product.category, product.description].some((value) => value.toLowerCase().includes(query)),
    );
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
}
