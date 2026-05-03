import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AdminService, DashboardData } from '../../../core/services/admin.service';
import { Order } from '../../../core/models/order.model';
import { Product } from '../../../core/models/product.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  template: `
    <div class="page-container">
      <div class="mb-8 rounded-lg bg-slate-950 text-white p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-amber-300">Admin monitoring mode</p>
            <h1 class="mt-2 text-3xl font-bold">Command Center</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-300">
              Admins supervise platform activity, manage catalog operations, and resolve orders. Customer checkout is disabled for admin accounts.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/admin/orders" class="btn bg-amber-500 text-slate-950 hover:bg-amber-400">
              Monitor orders
            </a>
            <a routerLink="/admin/products/new" class="btn border border-slate-600 text-white hover:bg-slate-900">
              Add product
            </a>
            <a routerLink="/admin/reports" class="btn border border-slate-600 text-white hover:bg-slate-900">
              Review reports
            </a>
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          @for (card of statCards(); track card.label) {
            <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.label }}</p>
              <p class="mt-3 text-3xl font-bold text-slate-950">{{ card.value }}</p>
              <p class="mt-1 text-sm" [class]="card.tone">{{ card.sub }}</p>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section class="xl:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 class="text-lg font-bold text-slate-950">Recent Order Activity</h2>
                <p class="text-sm text-slate-500">Newest customer orders for review and status updates.</p>
              </div>
              <a routerLink="/admin/orders" class="text-sm font-semibold text-primary-600 hover:text-primary-700">View all</a>
            </div>

            @if (recentOrders().length === 0) {
              <p class="py-10 text-center text-sm text-slate-400">No orders found.</p>
            } @else {
              <div class="divide-y divide-slate-100">
                @for (order of recentOrders(); track order.id) {
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4">
                    <div>
                      <p class="font-semibold text-slate-950">Order #{{ order.id ?? 'new' }}</p>
                      <p class="text-sm text-slate-500">
                        User {{ order.userId }} | {{ itemCount(order) }} item(s)
                      </p>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-sm font-bold text-slate-900">{{ money(order.totalPrice) }}</span>
                      <span class="rounded-full px-3 py-1 text-xs font-semibold" [class]="statusClass(order.status)">
                        {{ order.status ?? 'UNKNOWN' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </section>

          <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-bold text-slate-950">Status Pressure</h2>
            <p class="text-sm text-slate-500 mb-5">Orders grouped by current workflow state.</p>
            <div class="space-y-3">
              @for (entry of statusBreakdown(); track entry.status) {
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="font-medium text-slate-700">{{ entry.status }}</span>
                    <span class="font-bold text-slate-950">{{ entry.count }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div class="h-full rounded-full bg-amber-500" [style.width.%]="entry.percent"></div>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="xl:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 class="text-lg font-bold text-slate-950">Catalog Watchlist</h2>
                <p class="text-sm text-slate-500">Low or empty inventory that needs admin attention.</p>
              </div>
              <a routerLink="/admin/products" class="text-sm font-semibold text-primary-600 hover:text-primary-700">Manage products</a>
            </div>

            @if (lowStockProducts().length === 0) {
              <p class="py-8 text-center text-sm text-slate-400">No low-stock products right now.</p>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (product of lowStockProducts(); track product.id) {
                  <a [routerLink]="['/admin/products', product.id, 'edit']" class="rounded-lg border border-slate-200 p-4 hover:border-amber-300 hover:bg-amber-50 transition-colors">
                    <p class="font-semibold text-slate-950 line-clamp-1">{{ product.name }}</p>
                    <p class="mt-1 text-sm" [class]="product.stock === 0 ? 'text-danger-600' : 'text-warning-700'">
                      {{ product.stock }} in stock
                    </p>
                  </a>
                }
              </div>
            }
          </section>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  data     = signal<DashboardData | null>(null);
  orders   = signal<Order[]>([]);
  products = signal<Product[]>([]);
  loading  = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    forkJoin({
      dashboard: this.adminService.getDashboard().pipe(catchError(() => of(this.emptyDashboard()))),
      orders: this.adminService.getAllOrders().pipe(catchError(() => of([] as Order[]))),
      products: this.adminService.getProducts().pipe(catchError(() => of([] as Product[]))),
    }).subscribe({
      next: ({ dashboard, orders, products }) => {
        this.data.set(dashboard);
        this.orders.set(orders);
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statCards() {
    const d = this.data() ?? this.emptyDashboard();
    const pending = this.pendingCount();
    return [
      { label: 'Total Orders', value: d.totalOrders ?? this.orders().length, sub: 'All customer orders', tone: 'text-slate-500' },
      { label: 'Total Revenue', value: this.money(d.totalRevenue ?? 0), sub: 'Across completed activity', tone: 'text-success-600' },
      { label: 'Products', value: d.totalProducts ?? this.products().length, sub: 'Catalog records', tone: 'text-slate-500' },
      { label: 'Needs Attention', value: pending + this.lowStockProducts().length, sub: `${pending} pending, ${this.lowStockProducts().length} low stock`, tone: pending > 0 ? 'text-warning-700' : 'text-success-600' },
    ];
  }

  recentOrders(): Order[] {
    return [...this.orders()]
      .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
      .slice(0, 5);
  }

  statusBreakdown(): Array<{ status: string; count: number; percent: number }> {
    const counts = new Map<string, number>();
    for (const order of this.orders()) {
      const status = (order.status ?? 'UNKNOWN').toUpperCase();
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    const total = Math.max(this.orders().length, 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({ status, count, percent: Math.round((count / total) * 100) }));
  }

  lowStockProducts(): Product[] {
    return this.products()
      .filter(product => product.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);
  }

  pendingCount(): number {
    return this.orders().filter(order => ['PENDING', 'DRAFT', 'CHECKOUT'].includes((order.status ?? '').toUpperCase())).length;
  }

  itemCount(order: Order): number {
    return order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
  }

  money(value: number | undefined | null): string {
    return `INR ${(value ?? 0).toFixed(2)}`;
  }

  statusClass(status?: string): string {
    const normalized = (status ?? '').toUpperCase();
    if (['DELIVERED', 'CONFIRMED', 'PAID'].includes(normalized)) return 'bg-success-100 text-success-700';
    if (['PENDING', 'CHECKOUT'].includes(normalized)) return 'bg-warning-100 text-warning-700';
    if (['CANCELLED', 'FAILED'].includes(normalized)) return 'bg-danger-100 text-danger-700';
    return 'bg-slate-100 text-slate-700';
  }

  private emptyDashboard(): DashboardData {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      pendingOrders: 0,
    };
  }
}
