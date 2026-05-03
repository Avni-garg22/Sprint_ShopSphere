import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, ConfirmDialogComponent, CurrencyFormatPipe],
  template: `
    <div class="page-container">
      <h1 class="section-title">Shopping Cart</h1>

      @if (loading()) {
        <app-spinner />
      } @else if (items().length === 0) {
        <div class="text-center py-20">
          <svg class="w-20 h-20 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p class="text-gray-400 text-lg mb-4">Your cart is empty</p>
          <a routerLink="/products" class="btn btn-primary">Browse Products</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Items list -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of items(); track item.id) {
              <div class="card p-4 flex items-center gap-4">
                <div class="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 truncate">{{ item.productName }}</p>
                  <p class="text-sm text-gray-500">{{ item.price | currencyFormat }} each</p>
                </div>

                <!-- Quantity controls -->
                <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button (click)="decrement(item)"
                          class="px-2 py-1 text-gray-600 hover:bg-gray-50 transition-colors text-sm">−</button>
                  <span class="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{{ item.quantity }}</span>
                  <button (click)="increment(item)"
                          class="px-2 py-1 text-gray-600 hover:bg-gray-50 transition-colors text-sm">+</button>
                </div>

                <p class="font-bold text-gray-900 w-20 text-right">
                  {{ item.price * item.quantity | currencyFormat }}
                </p>

                <button (click)="confirmRemove(item)"
                        class="text-gray-400 hover:text-danger-600 transition-colors p-1">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Order summary -->
          <div class="lg:col-span-1">
            <div class="card p-6 sticky top-24">
              <h3 class="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div class="space-y-2 text-sm mb-4">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal ({{ itemCount() }} items)</span>
                  <span>{{ total() | currencyFormat }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span class="text-success-600">Free</span>
                </div>
              </div>
              <div class="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span class="text-primary-600 text-lg">{{ total() | currencyFormat }}</span>
              </div>
              <a routerLink="/checkout" class="btn btn-primary w-full btn-lg">
                Proceed to Checkout
              </a>
              <a routerLink="/products" class="btn btn-secondary w-full mt-3">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [visible]="showConfirm()"
      title="Remove item"
      message="Remove this item from your cart?"
      confirmLabel="Remove"
      (confirm)="removeItem()"
      (cancel)="showConfirm.set(false)"
    />
  `,
})
export class CartComponent implements OnInit {
  loading     = signal(true);
  showConfirm = signal(false);
  private pendingRemoveId: number | null = null;

  items     = () => this.cartService.cart()?.items ?? [];
  itemCount = () => this.cartService.itemCount();
  total     = () => this.cartService.cartTotal();

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) { this.loading.set(false); return; }

    this.cartService.loadCart(user.id).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  increment(item: CartItem): void {
    this.cartService.updateItem(item.id, item.quantity + 1).subscribe({
      error: () => this.toast.error('Failed to update quantity'),
    });
  }

  decrement(item: CartItem): void {
    if (item.quantity <= 1) { this.confirmRemove(item); return; }
    this.cartService.updateItem(item.id, item.quantity - 1).subscribe({
      error: () => this.toast.error('Failed to update quantity'),
    });
  }

  confirmRemove(item: CartItem): void {
    this.pendingRemoveId = item.id;
    this.showConfirm.set(true);
  }

  removeItem(): void {
    if (this.pendingRemoveId == null) return;
    this.cartService.removeItem(this.pendingRemoveId).subscribe({
      next: () => { this.toast.success('Item removed'); this.showConfirm.set(false); },
      error: () => this.toast.error('Failed to remove item'),
    });
  }
}
