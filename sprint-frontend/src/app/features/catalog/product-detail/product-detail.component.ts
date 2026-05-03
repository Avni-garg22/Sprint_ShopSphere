import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SpinnerComponent, CurrencyFormatPipe],
  template: `
    <div class="page-container">
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <a routerLink="/" class="hover:text-primary-600">Home</a>
        <span>/</span>
        <a routerLink="/products" class="hover:text-primary-600">Products</a>
        @if (product()) {
          <span>/</span>
          <span class="text-gray-900">{{ product()!.name }}</span>
        }
      </nav>

      @if (loading()) {
        <app-spinner />
      } @else if (!product()) {
        <div class="text-center py-20 text-gray-400">Product not found.</div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Image -->
          <div class="bg-gray-100 rounded-2xl overflow-hidden aspect-square">
            @if (product()!.imageUrl) {
              <img [src]="imageSrc(product()!.imageUrl!)" [alt]="product()!.name"
                   class="w-full h-full object-cover" />
            } @else {
              <div class="w-full h-full flex items-center justify-center text-gray-300">
                <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            }
          </div>

          <!-- Details -->
          <div class="flex flex-col gap-4">
            @if (product()!.category) {
              <span class="text-sm text-primary-600 font-medium uppercase tracking-wide">
                {{ product()!.category!.name }}
              </span>
            }
            <h1 class="text-3xl font-bold text-gray-900">{{ product()!.name }}</h1>
            <p class="text-3xl font-bold text-primary-600">{{ product()!.price | currencyFormat }}</p>

            <p class="text-gray-600 leading-relaxed">{{ product()!.description }}</p>

            <!-- Stock -->
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full"
                   [class]="product()!.stock > 0 ? 'bg-green-500' : 'bg-red-500'"></div>
              <span class="text-sm font-medium"
                    [class]="product()!.stock > 0 ? 'text-success-600' : 'text-danger-600'">
                {{ product()!.stock > 0 ? product()!.stock + ' in stock' : 'Out of stock' }}
              </span>
            </div>

            @if (isAdmin()) {
              <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p class="font-semibold">Admin monitoring mode</p>
                <p class="mt-1">Admins can review catalog details, update products, and monitor orders. Shopping and checkout actions are disabled for admin accounts.</p>
              </div>
              <div class="flex flex-wrap gap-3 mt-2">
                <a [routerLink]="['/admin/products', product()!.id, 'edit']" class="btn btn-primary">
                  Manage product
                </a>
                <a routerLink="/admin/orders" class="btn btn-secondary">
                  Monitor orders
                </a>
              </div>
            }

            <!-- Quantity + Add to cart -->
            @if (product()!.stock > 0 && !isAdmin()) {
              <div class="flex items-center gap-4 mt-2">
                <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button (click)="decQty()"
                          class="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors">−</button>
                  <span class="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">{{ qty }}</span>
                  <button (click)="incQty()"
                          class="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors">+</button>
                </div>
                <button class="btn btn-primary btn-lg flex-1" (click)="addToCart()">
                  Add to cart
                </button>
              </div>
            }

            <!-- Featured badge -->
            @if (product()!.featured) {
              <div class="inline-flex items-center gap-1 text-sm text-yellow-600 font-medium">
                ⭐ Featured product
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  qty = 1;
  isAdmin: () => boolean;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private auth: AuthService,
    private toast: ToastService,
  ) {
    this.isAdmin = this.auth.isAdmin;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  decQty(): void { if (this.qty > 1) this.qty--; }
  incQty(): void { const p = this.product(); if (p && this.qty < p.stock) this.qty++; }

  imageSrc(imageUrl: string): string {
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    if (imageUrl.startsWith('/gateway/')) return `${environment.apiUrl}${imageUrl}`;
    if (imageUrl.startsWith('/uploads/')) return `${environment.catalogAssets}${imageUrl}`;
    return imageUrl;
  }

  addToCart(): void {
    const user = this.auth.currentUser();
    const p    = this.product();
    if (!user) { this.toast.info('Please sign in to add items to cart'); return; }
    if (this.auth.isAdmin()) {
      this.toast.info('Admins can monitor and manage products from the admin panel.');
      return;
    }
    if (!p)    return;

    this.cartService.addItem(user.id, {
      productId: p.id,
      productName: p.name,
      quantity: this.qty,
      price: p.price,
    }).subscribe({
      next: () => this.toast.success(`${p.name} added to cart`),
      error: () => this.toast.error('Failed to add item to cart'),
    });
  }
}
