import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { Product, ProductsService } from '../../shared/services/products/products.service';
import { BillingService } from '../billing.service';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.css',
})
export class ProductCatalogComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly billingService = inject(BillingService);
  private readonly apiBaseUrl = 'https://localhost:55142';

  readonly products = this.productsService.products;
  readonly searchQuery = signal('');
  readonly quantities = signal<Record<number, number>>({});
  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return query
      ? this.products().filter((product) => [product.name, product.category, product.description].some((value) => value.toLowerCase().includes(query)))
      : this.products();
  });

  ngOnInit(): void {
    void this.productsService.loadAll();
  }

  updateSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  quantityFor(productId: number): number {
    return this.quantities()[productId] ?? 1;
  }

  updateQuantity(productId: number, quantity: number): void {
    this.quantities.update((quantities) => ({
      ...quantities,
      [productId]: Math.max(1, Math.floor(quantity) || 1),
    }));
  }

  addToBill(product: Product): void {
    this.billingService.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: this.quantityFor(product.id),
    });
  }

  imageUrl(product: Product): string | null {
    return product.imageUrl ? `${this.apiBaseUrl}${product.imageUrl}` : null;
  }
}
