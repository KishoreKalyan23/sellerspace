import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductSignalService } from '../../services/product-signal.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.css'
})
export class FavoritesPageComponent {
  readonly service = inject(ProductSignalService);
  readonly userService = inject(UserService);

  get favorites() {
    return this.service.favoriteProducts();
  }
}
