import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductsService } from '../../shared/services/products/products.service';
import { CategoriesService } from '../../shared/services/categories/categories.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);

  readonly categories = this.categoriesService.categories;

  @Input() embedded = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    category: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    taxPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    description: [''],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  isEditMode = false;
  productId: number | null = null;
  isSaving = false;
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    const parsedId = Number(idParam);
    const product = this.productsService.getById(parsedId);
    if (product) {
      this.isEditMode = true;
      this.productId = product.id;
      this.form.patchValue(product);
      this.imagePreviewUrls = product.imageUrl ? [this.toImageUrl(product.imageUrl)] : [];
      return;
    }

    void this.productsService.loadAll().then(() => {
      const loadedProduct = this.productsService.getById(parsedId);
      if (!loadedProduct) {
        this.router.navigate(['/products']);
        return;
      }

      this.isEditMode = true;
      this.productId = loadedProduct.id;
      this.form.patchValue(loadedProduct);
      this.imagePreviewUrls = loadedProduct.imageUrl ? [this.toImageUrl(loadedProduct.imageUrl)] : [];
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const images = Array.from(input.files ?? []);
    if (images.length === 0) {
      return;
    }

    this.selectedImages = images.slice(0, 6);
    this.imagePreviewUrls = this.selectedImages.map((image) => URL.createObjectURL(image));
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;

    try {
      const payload = this.form.getRawValue();
      const savedProduct = {
        id: this.productId ?? 0,
        name: payload.name ?? '',
        category: payload.category ?? '',
        price: Number(payload.price ?? 0),
        taxPercent: Number(payload.taxPercent ?? 0),
        description: payload.description ?? '',
        stockQuantity: Number(payload.stockQuantity ?? 0),
      };

      const product = await this.productsService.save(savedProduct);
      if (this.selectedImages.length > 0) {
        await this.productsService.uploadImages(product.id, this.selectedImages);
      }
      await this.productsService.loadAll();

      if (this.embedded) {
        this.saved.emit();
      } else {
        this.router.navigate(['/products']);
      }
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    if (this.embedded) {
      this.closed.emit();
    } else {
      this.router.navigate(['/products']);
    }
  }

  private toImageUrl(imageUrl: string): string {
    return imageUrl.startsWith('/') ? `https://localhost:55142${imageUrl}` : imageUrl;
  }
}
