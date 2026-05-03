import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, SpinnerComponent],
  template: `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.22),transparent_28rem),radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.24),transparent_24rem)]"></div>
      <div class="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
        <div class="text-center lg:text-left">
          <span class="glass-chip">
            New arrivals every week
          </span>
          <h1 class="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            Shop smarter with <span class="text-primary-700">ShopSphere</span>
          </h1>
          <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Discover fresh products, compare the essentials quickly, and move from browse to cart without the flat storefront feeling.
          </p>
          <div class="mt-7 flex flex-wrap justify-center gap-4 lg:justify-start">
            <a [routerLink]="isAdmin() ? '/admin/dashboard' : '/products'" class="btn btn-primary btn-lg font-bold shadow-xl shadow-primary-700/20">
              {{ isAdmin() ? 'Open Admin Console' : 'Browse Products' }}
            </a>
            @if (!isLoggedIn()) {
              <a routerLink="/auth/register" class="btn btn-secondary btn-lg border-white/70 bg-white/70 font-bold shadow-lg backdrop-blur hover:bg-white">
                Get Started
              </a>
            } @else if (isAdmin()) {
              <a routerLink="/admin/orders" class="btn btn-secondary btn-lg border-white/70 bg-white/70 font-bold shadow-lg backdrop-blur hover:bg-white">
                Monitor Orders
              </a>
            } @else {
              <a routerLink="/orders" class="btn btn-secondary btn-lg border-white/70 bg-white/70 font-bold shadow-lg backdrop-blur hover:bg-white">
                My Orders
              </a>
            }
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-md lg:max-w-none">
          <div class="absolute -left-4 top-8 h-24 w-24 rounded-3xl bg-teal-300/40 blur-2xl"></div>
          <div class="absolute -right-4 bottom-10 h-28 w-28 rounded-3xl bg-amber-300/50 blur-2xl"></div>
          <div class="glass-panel relative rounded-3xl p-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="rounded-2xl bg-slate-950 p-5 text-white shadow-xl">
                <p class="text-xs font-semibold uppercase text-teal-200">Featured</p>
                <p class="mt-8 text-3xl font-black">{{ featured().length || 'Live' }}</p>
                <p class="mt-2 text-sm text-slate-300">curated picks</p>
              </div>
              <div class="rounded-2xl border border-white/70 bg-white/65 p-5 shadow-lg backdrop-blur">
                <p class="text-xs font-semibold uppercase text-slate-500">Delivery</p>
                <p class="mt-8 text-3xl font-black text-slate-950">Fast</p>
                <p class="mt-2 text-sm text-slate-500">checkout ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    @if (isAdmin()) {
      <section class="bg-amber-50 border-b border-amber-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-amber-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p><span class="font-semibold">Admin view:</span> storefront browsing is read-only for admin accounts.</p>
          <a routerLink="/admin/dashboard" class="font-semibold text-amber-900 hover:underline">Return to command center</a>
        </div>
      </section>
    }

    <section class="page-container">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="section-title mb-0">Featured Products</h2>
        <a routerLink="/products" class="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-bold text-primary-700 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white">
          View all
        </a>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (featured().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <p class="text-lg">No featured products yet.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (product of featured(); track product.id) {
            <app-product-card
              [product]="product"
              [canAddToCart]="!isAdmin()"
              (addToCart)="onAddToCart($event)"
            />
          }
        </div>
      }
    </section>

    <section class="border-y border-white/60 bg-white/45 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row lg:px-8">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ isAdmin() ? 'Continue monitoring?' : 'Ready to start shopping?' }}</h3>
          <p class="text-gray-500 mt-1">{{ isAdmin() ? 'Return to the admin console for orders, stock, and reports.' : 'Browse our full catalog and find what you need.' }}</p>
        </div>
        <a [routerLink]="isAdmin() ? '/admin/dashboard' : '/products'" class="btn btn-primary btn-lg whitespace-nowrap shadow-xl shadow-primary-700/20">
          {{ isAdmin() ? 'Open Admin Console' : 'Shop Now' }}
        </a>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  featured = signal<Product[]>([]);
  loading  = signal(true);
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private auth: AuthService,
    private toast: ToastService,
  ) {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.isAdmin = this.auth.isAdmin;
  }

  ngOnInit(): void {
    this.productService.getFeatured().subscribe({
      next: products => { this.featured.set(products); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  onAddToCart(product: Product): void {
    const user = this.auth.currentUser();
    if (!user) { this.toast.info('Please sign in to add items to cart'); return; }
    if (this.auth.isAdmin()) {
      this.toast.info('Admins can monitor activity from the admin console.');
      return;
    }

    this.cartService.addItem(user.id, {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
    }).subscribe({
      next: () => this.toast.success(`${product.name} added to cart`),
      error: () => this.toast.error('Failed to add item to cart'),
    });
  }
}
