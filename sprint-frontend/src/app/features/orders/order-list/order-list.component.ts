import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { OrderStatusPipe } from '../../../shared/pipes/order-status.pipe';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, BadgeComponent, CurrencyFormatPipe, OrderStatusPipe],
  template: `
    <div class="page-container">
      <h1 class="section-title">My Orders</h1>

      @if (loading()) {
        <app-spinner />
      } @else if (orders().length === 0) {
        <div class="text-center py-20">
          <svg class="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="text-gray-400 text-lg mb-4">No orders yet</p>
          <a routerLink="/products" class="btn btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="card p-6 hover:shadow-md transition-shadow">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-semibold text-gray-900">Order #{{ order.id }}</span>
                    <app-badge [label]="order.status | orderStatus" [variant]="statusVariant(order.status)" />
                  </div>
                  <p class="text-sm text-gray-500">
                    {{ order.items.length }} item(s)
                  </p>
                </div>
                <div class="flex items-center gap-6">
                  <div class="text-right">
                    <p class="text-xs text-gray-400">Total</p>
                    <p class="font-bold text-gray-900">{{ order.totalPrice | currencyFormat }}</p>
                  </div>
                  <a [routerLink]="['/orders', order.id]" class="btn btn-secondary btn-sm">
                    Track Order
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class OrderListComponent implements OnInit {
  orders  = signal<Order[]>([]);
  loading = signal(true);

  constructor(private orderService: OrderService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) { this.loading.set(false); return; }

    this.orderService.getMyOrders(user.id).subscribe({
      next: orders => { this.orders.set(orders); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      DELIVERED: 'success',
      CONFIRMED: 'info',
      SHIPPED:   'info',
      PENDING:   'warning',
      CANCELLED: 'danger',
    };
    return status ? (map[status] ?? 'default') : 'default';
  }
}
