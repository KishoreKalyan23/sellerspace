import { Component } from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { CategorySidebarComponent } from '../category-sidebar/category-sidebar.component';
import { ProductCatalogComponent } from '../product-catalog/product-catalog.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [SearchBarComponent, CategorySidebarComponent, ProductCatalogComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {}
