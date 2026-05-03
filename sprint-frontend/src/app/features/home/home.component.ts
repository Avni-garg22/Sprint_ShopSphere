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
    <section class="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center gap-6">
        <span class="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
          New arrivals every week
        </span>
        <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight max-w-2xl">
          Shop smarter with <span class="text-primary-200">ShopSphere</span>
        </h1>
        <p class="text-primary-100 text-lg max-w-xl">
          Discover thousands of products across all categories. Fast delivery, great prices.
        </p>
        <div class="flex gap-4 flex-wrap justify-center">
          <a [routerLink]="isAdmin() ? '/admin/dashboard' : '/products'" class="btn bg-white text-primary-700 hover:bg-primary-50 btn-lg font-semibold shadow-lg">
            {{ isAdmin() ? 'Open Admin Console' : 'Browse Products' }}
          </a>
          @if (!isLoggedIn()) {
            <a routerLink="/auth/register" class="btn border-2 border-white text-white hover:bg-white/10 btn-lg font-semibold">
              Get Started
            </a>
          } @else if (isAdmin()) {
            <a routerLink="/admin/orders" class="btn border-2 border-white text-white hover:bg-white/10 btn-lg font-semibold">
              Monitor Orders
            </a>
          } @else {
            <a routerLink="/orders" class="btn border-2 border-white text-white hover:bg-white/10 btn-lg font-semibold">
              My Orders
            </a>
          }
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
      <div class="flex items-center justify-between mb-6">
        <h2 class="section-title mb-0">Featured Products</h2>
        <a routerLink="/products" class="text-sm text-primary-600 font-medium hover:underline">
          View all ->
        </a>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (featured().length === 0) {
        <div class="text-center py-16 text-gray-400">
          <p class="text-lg">No featured products yet.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

    <section class="bg-primary-50 border-y border-primary-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ isAdmin() ? 'Continue monitoring?' : 'Ready to start shopping?' }}</h3>
          <p class="text-gray-500 mt-1">{{ isAdmin() ? 'Return to the admin console for orders, stock, and reports.' : 'Browse our full catalog and find what you need.' }}</p>
        </div>
        <a [routerLink]="isAdmin() ? '/admin/dashboard' : '/products'" class="btn btn-primary btn-lg whitespace-nowrap">
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
