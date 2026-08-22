import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { Product, ProductsService } from '../../shared/services/products/products.service';
import { BillingService } from '../billing.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

export type CatalogCardSize = 'compact' | 'comfortable' | 'large';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonComponent, EmptyStateComponent],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.css',
})
export class ProductCatalogComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly billingService = inject(BillingService);
  private readonly apiBaseUrl = 'https://localhost:55142';

  readonly products = this.productsService.products;
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('all');
  readonly cardSize = signal<CatalogCardSize>('compact');
  readonly quantities = signal<Record<number, number>>({});
  readonly categories = computed(() => Array.from(new Set(this.products().map((product) => product.category))).sort());
  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.products().filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesQuery =
        !query || [product.name, product.category, product.description].some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  });

  private readonly cartQuantities = computed(() => {
    const map: Record<number, number> = {};
    for (const item of this.billingService.billingItems()) {
      map[item.productId] = item.quantity;
    }
    return map;
  });

  ngOnInit(): void {
    void this.productsService.loadAll();
  }

  updateSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setCardSize(size: CatalogCardSize): void {
    this.cardSize.set(size);
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  availableStock(product: Product): number {
    const inCart = this.cartQuantities()[product.id] ?? 0;
    return Math.max(0, product.stockQuantity - inCart);
  }

  quantityFor(product: Product): number {
    const available = this.availableStock(product);
    const stored = this.quantities()[product.id] ?? (available > 0 ? 1 : 0);
    return Math.min(stored, available);
  }

  updateQuantity(product: Product, quantity: number): void {
    const available = this.availableStock(product);
    const normalized = available <= 0 ? 0 : Math.min(available, Math.max(1, Math.floor(quantity) || 1));
    this.quantities.update((quantities) => ({ ...quantities, [product.id]: normalized }));
  }

  addToBill(product: Product): void {
    const quantity = this.quantityFor(product);
    if (quantity <= 0) {
      return;
    }

    this.billingService.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  imageUrl(product: Product): string | null {
    return product.imageUrl ? `${this.apiBaseUrl}${product.imageUrl}` : null;
  }
}
