import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { OrderStatusPipe } from '../../../shared/pipes/order-status.pipe';
import { Order } from '../../../core/models/order.model';
import { Payment } from '../../../core/models/payment.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, BadgeComponent, CurrencyFormatPipe, OrderStatusPipe],
  template: `
    <div class="page-container max-w-3xl">
      <a routerLink="/orders" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        ← Back to Orders
      </a>

      @if (loading()) {
        <app-spinner />
      } @else if (!order()) {
        <div class="text-center py-16 text-gray-400">Order not found.</div>
      } @else {
        <div class="space-y-6">
          <!-- Header -->
          <div class="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900">Order #{{ order()!.id }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ order()!.items.length }} item(s)</p>
            </div>
            <app-badge [label]="order()!.status | orderStatus" [variant]="statusVariant(order()!.status)" />
          </div>

          <!-- Tracking -->
          <div class="card overflow-hidden">
            <div class="border-b border-slate-100 bg-slate-50 px-6 py-4">
              <p class="text-xs font-semibold uppercase tracking-widest text-primary-600">Order Tracking</p>
              <h2 class="mt-1 text-lg font-bold text-slate-950">{{ trackingTitle(order()!.status) }}</h2>
              <p class="mt-1 text-sm text-slate-500">{{ trackingDescription(order()!.status) }}</p>
            </div>

            @if (isCancelled(order()!.status)) {
              <div class="p-6">
                <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  This order has been cancelled. Please contact support if you need help with this purchase.
                </div>
              </div>
            } @else {
              <div class="p-6">
                <div class="grid gap-4 sm:grid-cols-4">
                  @for (step of trackingSteps; track step.status; let i = $index) {
                    <div class="relative">
                      @if (i < trackingSteps.length - 1) {
                        <div
                          class="absolute left-6 top-6 hidden h-0.5 w-full sm:block"
                          [class]="isStepComplete(i, order()!.status) ? 'bg-primary-500' : 'bg-slate-200'"
                        ></div>
                      }
                      <div class="relative flex gap-3 sm:block">
                        <div
                          class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
                          [class]="stepCircleClass(i, order()!.status)"
                        >
                          @if (isStepComplete(i, order()!.status)) {
                            <span>✓</span>
                          } @else {
                            <span>{{ i + 1 }}</span>
                          }
                        </div>
                        <div class="pt-1 sm:mt-3 sm:pt-0">
                          <p class="font-semibold text-slate-950">{{ step.label }}</p>
                          <p class="mt-1 text-xs leading-5 text-slate-500">{{ step.description }}</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Items -->
          <div class="card p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Items</h3>
            <div class="divide-y divide-gray-100">
              @for (item of order()!.items; track item.id) {
                <div class="flex items-center justify-between py-3">
                  <div>
                    <p class="font-medium text-gray-900">{{ item.productName }}</p>
                    <p class="text-sm text-gray-500">{{ item.price | currencyFormat }} × {{ item.quantity }}</p>
                  </div>
                  <p class="font-semibold">{{ item.price * item.quantity | currencyFormat }}</p>
                </div>
              }
            </div>
            <div class="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-900 mt-2">
              <span>Total</span>
              <span class="text-primary-600">{{ order()!.totalPrice | currencyFormat }}</span>
            </div>
          </div>

          <!-- Payment info -->
          @if (payments().length > 0) {
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Payment</h3>
              @for (payment of payments(); track payment.id) {
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Processed at {{ payment.processedAt | date:'medium' }}</p>
                    <p class="font-medium text-gray-900">{{ payment.amount | currencyFormat }}</p>
                  </div>
                  <app-badge
                    [label]="payment.status"
                    [variant]="payment.status === 'SUCCESS' ? 'success' : payment.status === 'FAILED' ? 'danger' : 'warning'"
                  />
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  order    = signal<Order | null>(null);
  payments = signal<Payment[]>([]);
  loading  = signal(true);
  trackingSteps = [
    { status: 'PENDING', label: 'Order placed', description: 'We received your order.' },
    { status: 'CONFIRMED', label: 'Confirmed', description: 'Payment and stock are verified.' },
    { status: 'SHIPPED', label: 'Shipped', description: 'Your package is on the way.' },
    { status: 'DELIVERED', label: 'Delivered', description: 'The order has reached you.' },
  ];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private paymentService: PaymentService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getById(id).subscribe({
      next: order => {
        this.order.set(order);
        this.loading.set(false);
        this.paymentService.getByOrderId(id).subscribe({
          next: p => this.payments.set(p),
          error: () => {},
        });
      },
      error: () => this.loading.set(false),
    });
  }

  statusVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      DELIVERED: 'success', CONFIRMED: 'info', SHIPPED: 'info', PENDING: 'warning', CANCELLED: 'danger',
    };
    return status ? (map[status] ?? 'default') : 'default';
  }

  currentStepIndex(status?: string): number {
    const normalized = String(status ?? '').toUpperCase();
    if (normalized === 'PAID' || normalized === 'PACKED') return 1;
    return this.trackingSteps.findIndex(step => step.status === normalized);
  }

  isCancelled(status?: string): boolean {
    return String(status ?? '').toUpperCase() === 'CANCELLED';
  }

  isStepComplete(index: number, status?: string): boolean {
    return this.currentStepIndex(status) >= index;
  }

  stepCircleClass(index: number, status?: string): string {
    const current = this.currentStepIndex(status);
    if (current > index) return 'border-primary-600 bg-primary-600 text-white';
    if (current === index) return 'border-primary-600 bg-white text-primary-700 shadow-sm';
    return 'border-slate-200 bg-white text-slate-400';
  }

  trackingTitle(status?: string): string {
    if (this.isCancelled(status)) return 'Order cancelled';
    const current = this.currentStepIndex(status);
    return current >= 0 ? this.trackingSteps[current].label : 'Order status unavailable';
  }

  trackingDescription(status?: string): string {
    if (this.isCancelled(status)) return 'This order is no longer active.';
    const current = this.currentStepIndex(status);
    return current >= 0
      ? this.trackingSteps[current].description
      : 'We could not determine the latest tracking step for this order.';
  }
}
