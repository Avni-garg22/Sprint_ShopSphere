import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { OrderStatusPipe } from '../../../shared/pipes/order-status.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, BadgeComponent, CurrencyFormatPipe, OrderStatusPipe],
  template: `
    <div class="page-container max-w-3xl">
      @if (loading()) {
        <app-spinner />
      } @else if (!order()) {
        <div class="text-center py-16">
          <p class="text-gray-400 mb-4">Order not found.</p>
          <a routerLink="/orders" class="btn btn-primary">View Orders</a>
        </div>
      } @else {
        <div class="card p-6 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-success-600 mb-1">Order confirmed</p>
              <h1 class="text-2xl font-bold text-gray-900">Order #{{ order()!.id }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ order()!.items.length }} item(s)</p>
            </div>
            <app-badge [label]="order()!.status | orderStatus" [variant]="statusVariant(order()!.status)" />
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div class="divide-y divide-gray-100">
            @for (item of order()!.items; track item.id) {
              <div class="flex justify-between py-3">
                <div>
                  <p class="font-medium text-gray-900">{{ item.productName }}</p>
                  <p class="text-sm text-gray-500">{{ item.price | currencyFormat }} x {{ item.quantity }}</p>
                </div>
                <p class="font-semibold text-gray-900">{{ item.price * item.quantity | currencyFormat }}</p>
              </div>
            }
          </div>
          <div class="flex justify-between items-center mt-4 text-lg font-bold">
            <span>Total</span>
            <span class="text-primary-600">{{ order()!.totalPrice | currencyFormat }}</span>
          </div>
          <div class="flex gap-3 mt-6">
            <a routerLink="/orders" class="btn btn-secondary flex-1">Order History</a>
            <a routerLink="/products" class="btn btn-primary flex-1">Continue Shopping</a>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderConfirmationComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loading.set(false);
      return;
    }

    this.orderService.getById(id).subscribe({
      next: order => { this.order.set(order); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      DELIVERED: 'success',
      CONFIRMED: 'info',
      SHIPPED: 'info',
      PENDING: 'warning',
      CANCELLED: 'danger',
      FAILED: 'danger',
    };
    return status ? (map[status] ?? 'default') : 'default';
  }
}
