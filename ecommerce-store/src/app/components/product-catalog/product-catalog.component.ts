import { Component, inject } from '@angular/core';
import { ProductSignalService } from '../../services/product-signal.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.css'
})
export class ProductCatalogComponent {
  readonly service = inject(ProductSignalService);

  ngOnInit(): void {
    this.service.loadProducts();
  }

  getProductsForCategory(category: string): Product[] {
    return this.service.filteredProducts().filter((item: Product) => item.category === category);
  }
}
