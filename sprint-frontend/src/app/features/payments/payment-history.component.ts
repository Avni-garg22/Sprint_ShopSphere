import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { PaymentService } from '../../core/services/payment.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { Payment } from '../../core/models/payment.model';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, BadgeComponent, CurrencyFormatPipe],
  template: `
    <div class="page-container">
      <h1 class="section-title">Payment History</h1>

      @if (loading()) {
        <app-spinner />
      } @else if (payments().length === 0) {
        <div class="text-center py-20 text-gray-400">
          <p class="text-lg">No payments found.</p>
        </div>
      } @else {
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Payment ID</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Order ID</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Order</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (payment of payments(); track payment.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900">#{{ payment.id }}</td>
                    <td class="px-6 py-4 text-gray-600">#{{ payment.orderId }}</td>
                    <td class="px-6 py-4 font-semibold text-gray-900">{{ payment.amount | currencyFormat }}</td>
                    <td class="px-6 py-4">
                      <app-badge
                        [label]="payment.status"
                        [variant]="payment.status === 'SUCCESS' ? 'success' : payment.status === 'FAILED' ? 'danger' : 'warning'"
                      />
                    </td>
                    <td class="px-6 py-4 text-gray-500">{{ payment.processedAt | date:'mediumDate' }}</td>
                    <td class="px-6 py-4">
                      <a [routerLink]="['/orders', payment.orderId]"
                         class="text-primary-600 hover:underline text-xs font-medium">
                        View Order
                      </a>
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
export class PaymentHistoryComponent implements OnInit {
  payments = signal<Payment[]>([]);
  loading  = signal(true);

  constructor(
    private paymentService: PaymentService,
    private orderService: OrderService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.loading.set(false);
      return;
    }

    this.orderService.getMyOrders(user.id).pipe(
      switchMap(orders => {
        const orderIds = orders
          .map(order => order.id)
          .filter((id): id is number => typeof id === 'number');

        if (orderIds.length === 0) {
          return of([]);
        }

        return forkJoin(
          orderIds.map(orderId =>
            this.paymentService.getByOrderId(orderId).pipe(catchError(() => of([])))
          )
        ).pipe(map(results => results.flat()));
      }),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: payments => this.payments.set(payments),
      error: () => this.payments.set([]),
    });
  }
}
