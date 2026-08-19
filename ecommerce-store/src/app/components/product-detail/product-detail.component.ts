import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductSignalService } from '../../services/product-signal.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ProductSignalService);

  product: ReturnType<ProductSignalService['products']>[number] | undefined;
  activeImageIndex = 0;

  ngOnInit(): void {
    this.service.loadProducts();
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    this.product = this.service.products().find((item) => item.id === productId);
  }

  toggleFavorite(): void {
    if (this.product) {
      this.service.toggleFavorite(this.product.id);
    }
  }

  isFavorite(): boolean {
    return this.product ? this.service.isFavorite(this.product.id) : false;
  }

  nextImage(): void {
    if (!this.product?.images?.length) {
      return;
    }

    this.activeImageIndex = (this.activeImageIndex + 1) % this.product.images.length;
  }

  previousImage(): void {
    if (!this.product?.images?.length) {
      return;
    }

    this.activeImageIndex = (this.activeImageIndex - 1 + this.product.images.length) % this.product.images.length;
  }

  selectImage(index: number): void {
    this.activeImageIndex = index;
  }
}
