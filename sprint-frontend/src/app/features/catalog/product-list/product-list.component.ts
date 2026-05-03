import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, SpinnerComponent],
  template: `
    <div class="page-container space-y-8">
      <!-- Header -->
      <div class="glass-panel relative overflow-hidden rounded-3xl">
        <div class="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-teal-100/80 via-amber-100/60 to-transparent"></div>
        <div class="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-teal-300/30 blur-2xl"></div>
        <div class="relative grid gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p class="text-xs font-bold uppercase text-teal-700">ShopSphere Catalog</p>
            <h1 class="mt-2 text-3xl font-black text-slate-950 sm:text-5xl">All Products</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Browse fresh picks, compare prices, and add what you love to your cart.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:flex">
            <div class="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Showing</p>
              <p class="mt-1 text-2xl font-bold text-slate-950">{{ filteredCount() }}</p>
            </div>
            <div class="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Categories</p>
              <p class="mt-1 text-2xl font-bold text-slate-950">{{ categories().length || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter bar -->
      <div class="glass-panel rounded-2xl p-3">
        <div class="flex flex-col gap-3 lg:flex-row">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch($event)"
            placeholder="Search products..."
            class="input border-white/70 bg-white/70 pl-10 shadow-sm backdrop-blur"
          />
        </div>

        <select [(ngModel)]="selectedCategoryId" (ngModelChange)="onCategoryChange()" class="input border-white/70 bg-white/70 shadow-sm backdrop-blur lg:w-56">
          <option [ngValue]="null">All categories</option>
          @for (category of categories(); track category.id) {
            <option [ngValue]="category.id">{{ category.name }}</option>
          }
        </select>

        <select [(ngModel)]="sortBy" (ngModelChange)="applySort()" class="input border-white/70 bg-white/70 shadow-sm backdrop-blur sm:w-52">
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span class="rounded-full bg-white/70 px-3 py-1 font-medium text-slate-700 shadow-sm">
            {{ filteredCount() }} products found
          </span>
          @if (searchQuery) {
            <button type="button" (click)="clearSearch()" class="rounded-full bg-primary-50 px-3 py-1 font-medium text-primary-700 hover:bg-primary-100">
              Clear search
            </button>
          }
        </div>
      </div>

      <!-- Products grid -->
      @if (loading()) {
        <app-spinner />
      } @else if (displayProducts().length === 0) {
        <div class="text-center py-20">
          <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-gray-400 text-lg">No products found</p>
          @if (searchQuery) {
            <button (click)="clearSearch()" class="btn btn-secondary mt-4">Clear search</button>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (product of pagedProducts(); track product.id) {
            <app-product-card
              [product]="product"
              [canAddToCart]="!isAdmin()"
              (addToCart)="onAddToCart($event)"
            />
          }
        </div>

        @if (totalPages() > 1) {
          <div class="mt-8 flex items-center justify-center gap-3">
            <button type="button" class="btn btn-secondary btn-sm border-white/70 bg-white/70 shadow-sm backdrop-blur" [disabled]="currentPage() === 1" (click)="previousPage()">
              Previous
            </button>
            <span class="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur">Page {{ currentPage() }} of {{ totalPages() }}</span>
            <button type="button" class="btn btn-secondary btn-sm border-white/70 bg-white/70 shadow-sm backdrop-blur" [disabled]="currentPage() === totalPages()" (click)="nextPage()">
              Next
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  products        = signal<Product[]>([]);
  displayProducts = signal<Product[]>([]);
  categories      = signal<Category[]>([]);
  loading         = signal(true);
  searchQuery     = '';
  sortBy          = '';
  selectedCategoryId: number | null = null;
  currentPage     = signal(1);
  pageSize        = 8;
  isAdmin: () => boolean;

  private search$ = new Subject<string>();

  filteredCount(): number {
    return this.displayProducts().length;
  }

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private auth: AuthService,
    private toast: ToastService,
  ) {
    this.isAdmin = this.auth.isAdmin;
  }

  ngOnInit(): void {
    this.search$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(q => {
      this.fetchProducts(q);
    });
    this.categoryService.getAll().subscribe({
      next: categories => this.categories.set(categories),
    });
    this.fetchProducts();
  }

  fetchProducts(search?: string): void {
    this.loading.set(true);
    this.productService.getAll(search, this.selectedCategoryId ?? undefined).subscribe({
      next: products => {
        this.products.set(products);
        this.currentPage.set(1);
        this.applySort();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(query: string): void {
    this.search$.next(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.fetchProducts();
  }

  onCategoryChange(): void {
    this.fetchProducts(this.searchQuery);
  }

  applySort(): void {
    let sorted = [...this.products()];
    if (this.sortBy === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
    if (this.sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (this.sortBy === 'name')       sorted.sort((a, b) => a.name.localeCompare(b.name));
    this.displayProducts.set(sorted);
    this.currentPage.set(1);
  }

  pagedProducts(): Product[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.displayProducts().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.displayProducts().length / this.pageSize));
  }

  previousPage(): void {
    this.currentPage.update(page => Math.max(1, page - 1));
  }

  nextPage(): void {
    this.currentPage.update(page => Math.min(this.totalPages(), page + 1));
  }

  onAddToCart(product: Product): void {
    const user = this.auth.currentUser();
    if (!user) { this.toast.info('Please sign in to add items to cart'); return; }
    if (this.auth.isAdmin()) {
      this.toast.info('Admins can manage products from the admin panel.');
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
