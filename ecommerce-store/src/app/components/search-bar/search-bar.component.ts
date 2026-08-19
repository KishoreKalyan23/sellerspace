import { Component, inject } from '@angular/core';
import { ProductSignalService } from '../../services/product-signal.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  readonly service = inject(ProductSignalService);

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.service.setSearchQuery(target.value);
  }
}
