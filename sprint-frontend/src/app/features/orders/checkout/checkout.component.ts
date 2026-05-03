import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { CartItem } from '../../../core/models/cart.model';
import { Order } from '../../../core/models/order.model';
import { RazorpayOrderResponse } from '../../../core/models/payment.model';

interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  handler: (response: RazorpayCheckoutResponse) => void;
}

interface RazorpayCheckoutInstance {
  open: () => void;
  on: (event: 'payment.failed', callback: (response: unknown) => void) => void;
}

interface RazorpayWindow extends Window {
  Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SpinnerComponent, CurrencyFormatPipe],
  template: `
    <div class="page-container max-w-3xl">
      <h1 class="section-title">Checkout</h1>

      @if (loading()) {
        <app-spinner />
      } @else if (items().length === 0) {
        <div class="text-center py-16">
          <p class="text-gray-400 mb-4">Your cart is empty.</p>
          <a routerLink="/products" class="btn btn-primary">Browse Products</a>
        </div>
      } @else {
        <div class="space-y-6">
          <div class="card p-4 sm:p-6">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              @for (step of steps; track step.key; let index = $index) {
                <button
                  type="button"
                  class="text-left rounded-lg border px-3 py-3 transition-colors"
                  [class.border-primary-600]="currentStep() === index"
                  [class.bg-primary-50]="currentStep() === index"
                  [class.border-gray-200]="currentStep() !== index"
                  (click)="goToStep(index)"
                >
                  <span class="block text-xs font-semibold text-gray-400">Step {{ index + 1 }}</span>
                  <span class="block text-sm font-semibold text-gray-900">{{ step.label }}</span>
                </button>
              }
            </div>
          </div>

          @if (currentStep() === 0) {
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Delivery Address</h3>
              <div class="grid gap-4">
                <input class="input" [(ngModel)]="address.fullName" placeholder="Full name" />
                <input class="input" [(ngModel)]="address.phone" placeholder="Phone number" />
                <textarea class="input min-h-24" [(ngModel)]="address.line1" placeholder="House number, street, area"></textarea>
                <div class="grid sm:grid-cols-3 gap-4">
                  <input class="input" [(ngModel)]="address.city" placeholder="City" />
                  <input class="input" [(ngModel)]="address.state" placeholder="State" />
                  <input class="input" [(ngModel)]="address.pincode" placeholder="Pincode" />
                </div>
              </div>
            </div>
          }

          @if (currentStep() === 1) {
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Delivery Option</h3>
              <div class="grid gap-3">
                @for (option of deliveryOptions; track option.id) {
                  <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-primary-300">
                    <span>
                      <span class="block font-semibold text-gray-900">{{ option.label }}</span>
                      <span class="block text-sm text-gray-500">{{ option.eta }}</span>
                    </span>
                    <input type="radio" name="delivery" [(ngModel)]="deliveryMode" [value]="option.id" />
                  </label>
                }
              </div>
            </div>
          }

          @if (currentStep() === 2) {
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div class="grid gap-3">
                @for (mode of paymentModes; track mode.id) {
                  <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-primary-300">
                    <span>
                      <span class="block font-semibold text-gray-900">{{ mode.label }}</span>
                      <span class="block text-sm text-gray-500">{{ mode.hint }}</span>
                    </span>
                    <input type="radio" name="payment" [(ngModel)]="paymentMode" [value]="mode.id" />
                  </label>
                }
              </div>
            </div>
          }

          @if (currentStep() === 3) {
            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Review Order</h3>
              <div class="divide-y divide-gray-100">
                @for (item of items(); track item.id) {
                  <div class="flex items-center justify-between py-3">
                    <div>
                      <p class="font-medium text-gray-900">{{ item.productName }}</p>
                      <p class="text-sm text-gray-500">{{ item.price | currencyFormat }} x {{ item.quantity }}</p>
                    </div>
                    <p class="font-semibold text-gray-900">{{ item.price * item.quantity | currencyFormat }}</p>
                  </div>
                }
              </div>
              <div class="mt-4 space-y-2 text-sm text-gray-600">
                <p><span class="font-medium text-gray-900">Ship to:</span> {{ addressSummary() }}</p>
                <p><span class="font-medium text-gray-900">Delivery:</span> {{ selectedDeliveryLabel() }}</p>
                <p><span class="font-medium text-gray-900">Payment:</span> {{ selectedPaymentLabel() }}</p>
              </div>
              <div class="mt-4 flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span class="text-primary-600">{{ total() | currencyFormat }}</span>
              </div>
            </div>
          }

          <div class="flex gap-4">
            @if (currentStep() === 0) {
              <a routerLink="/cart" class="btn btn-secondary flex-1">Back to Cart</a>
            } @else {
              <button type="button" class="btn btn-secondary flex-1" (click)="previousStep()">Back</button>
            }

            @if (currentStep() < steps.length - 1) {
              <button type="button" class="btn btn-primary flex-1" [disabled]="!canContinue()" (click)="nextStep()">Continue</button>
            } @else {
              <button
                class="btn btn-primary flex-1 btn-lg"
                [disabled]="placing() || !canContinue()"
                (click)="placeOrder()"
              >
                @if (placing()) {
                  <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Placing order...
                } @else {
                  Place Order
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  loading = signal(true);
  placing = signal(false);
  currentStep = signal(0);

  steps = [
    { key: 'address', label: 'Address' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' },
  ];

  address = {
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  };

  deliveryMode = 'standard';
  paymentMode = 'cod';

  deliveryOptions = [
    { id: 'standard', label: 'Standard Delivery', eta: '3-5 business days' },
    { id: 'express', label: 'Express Delivery', eta: '1-2 business days' },
  ];

  paymentModes = [
    { id: 'RAZORPAY', label: 'Razorpay Checkout', hint: 'Cards, UPI, wallets, and netbanking' },
    { id: 'cod', label: 'Cash on Delivery', hint: 'Pay when your order arrives' },
  ];

  items = () => this.cartService.cart()?.items ?? [];
  total = () => this.cartService.cartTotal();

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) { this.loading.set(false); return; }

    this.cartService.loadCart(user.id).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  goToStep(index: number): void {
    if (index <= this.currentStep() || this.canContinue()) {
      this.currentStep.set(index);
    }
  }

  nextStep(): void {
    if (!this.canContinue()) return;
    this.currentStep.update(step => Math.min(step + 1, this.steps.length - 1));
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(step - 1, 0));
  }

  canContinue(): boolean {
    if (this.currentStep() === 0) {
      return Object.values(this.address).every(value => value.trim().length > 0);
    }
    return true;
  }

  addressSummary(): string {
    return [this.address.line1, this.address.city, this.address.state, this.address.pincode]
      .filter(Boolean)
      .join(', ');
  }

  selectedDeliveryLabel(): string {
    return this.deliveryOptions.find(option => option.id === this.deliveryMode)?.label ?? 'Standard Delivery';
  }

  selectedPaymentLabel(): string {
    return this.paymentModes.find(mode => mode.id === this.paymentMode)?.label ?? 'Cash on Delivery';
  }

  placeOrder(): void {
    const user  = this.auth.currentUser();
    const items = this.items();
    if (!user || items.length === 0 || !this.canContinue()) return;

    this.placing.set(true);
    const order = {
      userId: user.id,
      customerName: this.address.fullName,
      phone: this.address.phone,
      addressLine: this.address.line1,
      city: this.address.city,
      state: this.address.state,
      pincode: this.address.pincode,
      deliveryMode: this.deliveryMode,
      paymentMode: this.paymentMode,
      items: items.map((i: CartItem) => ({
        productId:   i.productId,
        productName: i.productName,
        quantity:    i.quantity,
        price:       i.price,
      })),
    };

    this.orderService.placeOrder(order).subscribe({
      next: res => {
        if (this.isRazorpayPayment()) {
          this.startRazorpayCheckout(res.order, user.id);
          return;
        }

        this.finishCheckout(user.id, res.order, res.message || 'Order placed successfully!');
      },
      error: (err: Error) => {
        this.placing.set(false);
        this.toast.error(err.message || 'Failed to place order');
      },
    });
  }

  private isRazorpayPayment(): boolean {
    return this.paymentMode.toUpperCase() === 'RAZORPAY';
  }

  private startRazorpayCheckout(order: Order, userId: number): void {
    const orderId = order.id;
    const amount = order.totalPrice ?? this.total();

    if (!orderId) {
      this.placing.set(false);
      this.toast.error('Order was created without an id. Payment cannot start.');
      return;
    }

    this.paymentService.createRazorpayOrder(orderId, amount).subscribe({
      next: razorpayOrder => {
        this.loadRazorpayScript()
          .then(() => this.openRazorpayCheckout(razorpayOrder, order, userId, amount))
          .catch(() => {
            this.placing.set(false);
            this.toast.error('Razorpay Checkout could not be loaded. Your order is still pending.');
            this.router.navigate(['/orders', orderId]);
          });
      },
      error: (err: Error) => {
        this.placing.set(false);
        this.toast.error(err.message || 'Unable to start Razorpay payment. Your order is still pending.');
        this.router.navigate(['/orders', orderId]);
      },
    });
  }

  private openRazorpayCheckout(
    razorpayOrder: RazorpayOrderResponse,
    order: Order,
    userId: number,
    amount: number,
  ): void {
    const Razorpay = (window as RazorpayWindow).Razorpay;
    const orderId = order.id;
    const user = this.auth.currentUser();
    let handled = false;

    if (!Razorpay || !orderId) {
      this.placing.set(false);
      this.toast.error('Razorpay Checkout is unavailable. Your order is still pending.');
      return;
    }

    const checkout = new Razorpay({
      key: razorpayOrder.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Sprint',
      description: `Order #${orderId}`,
      order_id: razorpayOrder.orderId,
      prefill: {
        name: this.address.fullName,
        email: user?.email ?? '',
        contact: this.address.phone,
      },
      notes: {
        appOrderId: orderId.toString(),
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: () => {
          if (handled) return;
          handled = true;
          this.placing.set(false);
          this.toast.warning(`Payment was not completed. Order #${orderId} remains pending.`);
          this.router.navigate(['/orders', orderId]);
        },
      },
      handler: response => {
        handled = true;
        this.verifyRazorpayPayment(response, order, userId, amount);
      },
    });

    checkout.on('payment.failed', () => {
      if (handled) return;
      handled = true;
      this.placing.set(false);
      this.toast.error(`Payment failed. Order #${orderId} remains pending.`);
      this.router.navigate(['/orders', orderId]);
    });

    checkout.open();
  }

  private verifyRazorpayPayment(
    response: RazorpayCheckoutResponse,
    order: Order,
    userId: number,
    amount: number,
  ): void {
    const orderId = order.id;
    if (!orderId) {
      this.placing.set(false);
      this.toast.error('Order id is missing. Payment verification cannot continue.');
      return;
    }

    this.paymentService.verifyRazorpayPayment({
      orderId,
      amount,
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    }).subscribe({
      next: () => this.finishCheckout(userId, order, 'Payment verified. Order confirmed!'),
      error: (err: Error) => {
        this.placing.set(false);
        this.toast.error(err.message || 'Payment verification failed. Your order is still pending.');
        this.router.navigate(['/orders', orderId]);
      },
    });
  }

  private finishCheckout(userId: number, order: Order, message: string): void {
    this.placing.set(false);
    this.cartService.clearCart(userId).subscribe({ error: () => this.cartService.clearLocalCart() });
    this.toast.success(message);
    this.router.navigate(['/orders', order.id, 'confirmation'], {
      queryParams: { confirmed: true, paymentMode: this.paymentMode },
    });
  }

  private loadRazorpayScript(): Promise<void> {
    if ((window as RazorpayWindow).Razorpay) {
      return Promise.resolve();
    }

    const scriptUrl = 'https://checkout.razorpay.com/v1/checkout.js';
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay Checkout')), { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'));
      document.body.appendChild(script);
    });
  }
}
