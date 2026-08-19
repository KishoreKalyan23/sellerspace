import { Component, computed, inject } from '@angular/core';
import { ProductSignalService } from '../../services/product-signal.service';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  templateUrl: './category-sidebar.component.html',
  styleUrl: './category-sidebar.component.css'
})
export class CategorySidebarComponent {
  readonly service = inject(ProductSignalService);

  readonly selectedCategory = this.service.activeCategory;
  readonly categoryList = this.service.categories;

  selectCategory(category: string): void {
    this.service.setCategory(category);
  }
}
