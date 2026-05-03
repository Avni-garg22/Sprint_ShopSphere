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
    <div class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white hover:bg-white/85 hover:shadow-2xl hover:shadow-primary-900/15">
      <div class="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>

      <a [routerLink]="['/products', product.id]" class="relative m-3 block aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-white to-teal-50">
        @if (product.imageUrl) {
          <img
            [src]="imageSrc(product.imageUrl)"
            [alt]="product.name"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            (error)="onImgError($event)"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-white/10 opacity-80"></div>
        } @else {
          <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-teal-50 text-slate-300">
            <svg class="h-16 w-16 transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        }

        <div class="absolute left-3 top-3 flex flex-wrap gap-2">
          @if (product.featured) {
            <span class="rounded-full border border-white/60 bg-amber-300/90 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-sm backdrop-blur">
              Featured
            </span>
          }
          <span
            class="rounded-full border border-white/60 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur"
            [class]="stockBadgeClass()"
          >
            {{ stockLabel() }}
          </span>
        </div>

        <div class="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/75 text-slate-800 opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:opacity-100">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H8M17 7v9"/>
          </svg>
        </div>
      </a>

      <div class="flex flex-1 flex-col px-5 pb-5 pt-2">
        @if (product.category) {
          <span class="mb-2 text-xs font-bold uppercase text-teal-700">
            {{ product.category.name }}
          </span>
        }
        <a [routerLink]="['/products', product.id]"
           class="mb-2 line-clamp-2 min-h-11 text-base font-black leading-snug text-slate-950 transition-colors hover:text-primary-600">
          {{ product.name }}
        </a>
        <p class="mb-4 line-clamp-2 min-h-10 flex-1 text-sm leading-5 text-slate-600">{{ product.description }}</p>

        <div class="mt-auto flex items-end justify-between gap-3 rounded-xl border border-white/70 bg-white/60 p-3">
          <div>
            <p class="text-xs font-semibold uppercase text-slate-500">Price</p>
            <span class="text-xl font-black text-slate-950">{{ product.price | currencyFormat }}</span>
          </div>
          <span class="rounded-full bg-slate-950 px-2.5 py-1 text-right text-xs font-semibold text-white">
            {{ product.stock }} left
          </span>
        </div>

        @if (canAddToCart) {
          <button
            class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-primary-700/25 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            [disabled]="product.stock === 0"
            (click)="addToCart.emit(product)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 2m5 5a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
            Add to cart
          </button>
        } @else {
          <a
            [routerLink]="['/admin/products', product.id, 'edit']"
            class="btn btn-secondary mt-4 w-full"
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
    if (this.product.stock <= 0) return 'bg-red-100/90 text-red-700';
    if (this.product.stock <= 5) return 'bg-amber-100/90 text-amber-800';
    return 'bg-emerald-100/90 text-emerald-700';
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
