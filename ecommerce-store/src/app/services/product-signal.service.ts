import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product';

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Aero Knit Jacket',
    category: 'Outerwear',
    price: 129,
    vendor: 'Northstar Studio',
    badge: 'New',
    description: 'Lightweight shell with a refined silhouette for everyday movement.',
    rating: 4.8,
    image: '🧥',
    images: ['🧥', '🧢', '👔'],
    vendorAddress: '214 Mercer Street, New York, NY',
    vendorRegion: 'New York, USA',
    vendorNote: 'Ships from a design-forward studio with same-day dispatch.'
  },
  {
    id: 2,
    name: 'Lumen Desk Lamp',
    category: 'Home',
    price: 89,
    vendor: 'Atelier House',
    badge: 'Best Seller',
    description: 'Soft ambient lighting designed for focused work and calmer evenings.',
    rating: 4.9,
    image: '💡',
    images: ['💡', '🪑', '🛋️'],
    vendorAddress: '42 Harbor Avenue, Seattle, WA',
    vendorRegion: 'Seattle, USA',
    vendorNote: 'Known for premium lighting and artisan finish details.'
  },
  {
    id: 3,
    name: 'Cedar Leather Tote',
    category: 'Accessories',
    price: 158,
    vendor: 'Harbor Goods',
    badge: 'Editor Pick',
    description: 'Minimal structure with premium texture and room for daily essentials.',
    rating: 4.7,
    image: '👜',
    images: ['👜', '💼', '🧳'],
    vendorAddress: '18 Rue de l’Abbaye, Paris, FR',
    vendorRegion: 'Paris, France',
    vendorNote: 'Hand-finished accessories with global shipping support.'
  },
  {
    id: 4,
    name: 'Contour Runner',
    category: 'Footwear',
    price: 112,
    vendor: 'Flux Lab',
    badge: 'Limited',
    description: 'Balanced cushioning and a quiet profile made for city miles.',
    rating: 4.6,
    image: '👟',
    images: ['👟', '🥾', '🧦'],
    vendorAddress: '88 King Street, London, UK',
    vendorRegion: 'London, UK',
    vendorNote: 'A boutique label focused on performance-driven silhouettes.'
  },
  {
    id: 5,
    name: 'Velora Ceramic Set',
    category: 'Home',
    price: 64,
    vendor: 'Morrow & Co.',
    badge: 'Fresh Drop',
    description: 'Sculptural everyday tableware with a serene matte finish.',
    rating: 4.8,
    image: '🍶',
    images: ['🍶', '☕', '🫖'],
    vendorAddress: '7 Market Lane, Copenhagen, DK',
    vendorRegion: 'Copenhagen, Denmark',
    vendorNote: 'Minimalist tableware crafted for calm, elevated interiors.'
  },
  {
    id: 6,
    name: 'Mariner Wool Scarf',
    category: 'Accessories',
    price: 72,
    vendor: 'Northstar Studio',
    badge: 'Warm Pick',
    description: 'A plush knit with a clean drape for cool mornings and long commutes.',
    rating: 4.5,
    image: '🧣',
    images: ['🧣', '🧥', '🧢'],
    vendorAddress: '551 Aurora Road, Toronto, CA',
    vendorRegion: 'Toronto, Canada',
    vendorNote: 'Warm knitwear with a curated seasonal capsule release.'
  },
  {
    id: 7,
    name: 'Mariner Wool Scarf',
    category: 'Accessories',
    price: 72,
    vendor: 'Northstar Studio',
    badge: 'Warm Pick',
    description: 'A plush knit with a clean drape for cool mornings and long commutes.',
    rating: 4.5,
    image: '🧣',
    images: ['🧣', '🧥', '🧢'],
    vendorAddress: '551 Aurora Road, Toronto, CA',
    vendorRegion: 'Toronto, Canada',
    vendorNote: 'Warm knitwear with a curated seasonal capsule release.'
  },
  {
    id: 8,
    name: 'Mariner Wool Scarf',
    category: 'Accessories',
    price: 72,
    vendor: 'Northstar Studio',
    badge: 'Warm Pick',
    description: 'A plush knit with a clean drape for cool mornings and long commutes.',
    rating: 4.5,
    image: '🧣',
    images: ['🧣', '🧥', '🧢'],
    vendorAddress: '551 Aurora Road, Toronto, CA',
    vendorRegion: 'Toronto, Canada',
    vendorNote: 'Warm knitwear with a curated seasonal capsule release.'
  },
  {
    id: 9,
    name: 'Mariner Wool Scarf',
    category: 'Accessories',
    price: 72,
    vendor: 'Northstar Studio',
    badge: 'Warm Pick',
    description: 'A plush knit with a clean drape for cool mornings and long commutes.',
    rating: 4.5,
    image: '🧣',
    images: ['🧣', '🧥', '🧢'],
    vendorAddress: '551 Aurora Road, Toronto, CA',
    vendorRegion: 'Toronto, Canada',
    vendorNote: 'Warm knitwear with a curated seasonal capsule release.'
  },
  {
    id: 10,
    name: 'Mariner Wool Scarf',
    category: 'Accessories',
    price: 72,
    vendor: 'Northstar Studio',
    badge: 'Warm Pick',
    description: 'A plush knit with a clean drape for cool mornings and long commutes.',
    rating: 4.5,
    image: '🧣',
    images: ['🧣', '🧥', '🧢'],
    vendorAddress: '551 Aurora Road, Toronto, CA',
    vendorRegion: 'Toronto, Canada',
    vendorNote: 'Warm knitwear with a curated seasonal capsule release.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductSignalService {
  private readonly productsSignal = signal<Product[]>([]);
  private readonly activeCategorySignal = signal<string>('All');
  private readonly searchQuerySignal = signal<string>('');
  private readonly loadingSignal = signal(true);
  private readonly favoritesSignal = signal<number[]>([]);

  readonly products = this.productsSignal.asReadonly();
  readonly activeCategory = this.activeCategorySignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly favoriteProducts = computed(() => this.productsSignal().filter((product) => this.favoritesSignal().includes(product.id)));

  // The category and search terms stay in dedicated signals so every derived view can react automatically.
  readonly categories = computed(() => [
    'All',
    ...Array.from(new Set(this.productsSignal().map((product) => product.category)))
  ]);

  // The catalog list is derived from the current search and category signals instead of imperative filtering.
  readonly filteredProducts = computed(() => {
    const query = this.searchQuerySignal().trim().toLowerCase();
    const selectedCategory = this.activeCategorySignal();

    return this.productsSignal().filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const haystack = `${product.name} ${product.vendor} ${product.description}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);

      return matchesCategory && matchesQuery;
    });
  });

  loadProducts(): void {
    this.loadingSignal.set(true);

    window.setTimeout(() => {
      this.productsSignal.set(initialProducts);
      this.loadingSignal.set(false);
    }, 650);
  }

  setCategory(category: string): void {
    this.activeCategorySignal.set(category);
  }

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  toggleFavorite(productId: number): void {
    const current = this.favoritesSignal();
    this.favoritesSignal.set(
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  isFavorite(productId: number): boolean {
    return this.favoritesSignal().includes(productId);
  }
}
