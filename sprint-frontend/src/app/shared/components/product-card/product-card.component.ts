import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe],
  template: `
    <div class="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl">
      <!-- Image -->
      <a [routerLink]="['/products', product.id]" class="relative block aspect-square overflow-hidden bg-slate-100">
        @if (product.imageUrl) {
          <img
            [src]="imageSrc(product.imageUrl)"
            [alt]="product.name"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            (error)="onImgError($event)"
          />
        } @else {
          <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 text-slate-300">
            <svg class="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        }
        <div class="absolute left-3 top-3 flex flex-wrap gap-2">
          @if (product.featured) {
            <span class="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-sm">
              Featured
            </span>
          }
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm"
            [class]="stockBadgeClass()"
          >
            {{ stockLabel() }}
          </span>
        </div>
      </a>

      <!-- Info -->
      <div class="flex flex-1 flex-col p-4">
        @if (product.category) {
          <span class="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-600">
            {{ product.category.name }}
          </span>
        }
        <a [routerLink]="['/products', product.id]"
           class="mb-2 line-clamp-2 min-h-11 text-base font-bold leading-snug text-slate-950 transition-colors hover:text-primary-600">
          {{ product.name }}
        </a>
        <p class="mb-4 line-clamp-2 min-h-10 flex-1 text-sm leading-5 text-slate-500">{{ product.description }}</p>

        <div class="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Price</p>
            <span class="text-xl font-black text-slate-950">{{ product.price | currencyFormat }}</span>
          </div>
          <span class="text-right text-xs font-medium text-slate-500">
            {{ product.stock }} left
          </span>
        </div>

        @if (canAddToCart) {
          <button
            class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            [disabled]="product.stock === 0"
            (click)="addToCart.emit(product)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2m5 5a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
            Add to cart
          </button>
        } @else {
          <a
            [routerLink]="['/admin/products', product.id, 'edit']"
            class="btn btn-secondary w-full mt-4"
          >
            Manage product
          </a>
        }
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() canAddToCart = true;
  @Output() addToCart = new EventEmitter<Product>();

  stockLabel(): string {
    if (this.product.stock <= 0) return 'Out of stock';
    if (this.product.stock <= 5) return 'Low stock';
    return 'In stock';
  }

  stockBadgeClass(): string {
    if (this.product.stock <= 0) return 'bg-red-100 text-red-700';
    if (this.product.stock <= 5) return 'bg-amber-100 text-amber-800';
    return 'bg-emerald-100 text-emerald-700';
  }

  imageSrc(imageUrl: string): string {
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    if (imageUrl.startsWith('/gateway/')) return `${environment.apiUrl}${imageUrl}`;
    if (imageUrl.startsWith('/uploads/')) return `${environment.catalogAssets}${imageUrl}`;
    return imageUrl;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
