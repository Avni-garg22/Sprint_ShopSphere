import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { OrderStatusPipe } from '../../../shared/pipes/order-status.pipe';
import { Order } from '../../../core/models/order.model';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'DRAFT',
  'CHECKOUT',
  'PAID',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
];

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, BadgeComponent, CurrencyFormatPipe, OrderStatusPipe],
  template: `
    <div class="page-container">
      <div class="flex items-center justify-between mb-6">
        <h1 class="section-title mb-0">All Orders</h1>
        <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()" class="input w-44">
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (filtered().length === 0) {
        <div class="text-center py-16 text-gray-400">No orders found.</div>
      } @else {
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Order ID</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">User ID</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Items</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Total</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Update Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (order of filtered(); track order.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900">#{{ order.id }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ order.userId }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ order.items.length }}</td>
                    <td class="px-6 py-4 font-semibold text-gray-900">{{ order.totalPrice | currencyFormat }}</td>
                    <td class="px-6 py-4">
                      <app-badge [label]="order.status | orderStatus" [variant]="statusVariant(order.status)" />
                    </td>
                    <td class="px-6 py-4">
                      <select
                        [value]="order.status"
                        (change)="updateStatus(order, $event)"
                        class="input py-1 text-xs w-36"
                      >
                        @for (s of statuses; track s) {
                          <option [value]="s">{{ s }}</option>
                        }
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderTableComponent implements OnInit {
  orders       = signal<Order[]>([]);
  filtered     = signal<Order[]>([]);
  loading      = signal(true);
  filterStatus = '';
  statuses     = ORDER_STATUSES;

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.adminService.getAllOrders().subscribe({
      next: orders => {
        this.orders.set(orders);
        this.filtered.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilter(): void {
    const all = this.orders();
    this.filtered.set(
      this.filterStatus ? all.filter(o => o.status === this.filterStatus) : all
    );
  }

  updateStatus(order: Order, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.adminService.updateOrderStatus(order.id!, status).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.applyFilter();
        this.toast.success(`Order #${order.id} updated to ${status}`);
      },
      error: () => this.toast.error('Failed to update order status'),
    });
  }

  statusVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      DELIVERED: 'success',
      CONFIRMED: 'info',
      PAID: 'info',
      PACKED: 'info',
      SHIPPED: 'info',
      PENDING: 'warning',
      CHECKOUT: 'warning',
      DRAFT: 'default',
      CANCELLED: 'danger',
      FAILED: 'danger',
    };
    return status ? (map[status] ?? 'default') : 'default';
  }
}
