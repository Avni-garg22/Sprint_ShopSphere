import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  // Gateway prefix: /gateway/orders → service path: /orders/**
  private base = environment.gatewayOrders;

  private _cart = signal<Cart | null>(null);
  readonly cart      = computed(() => this._cart());
  readonly itemCount = computed(() =>
    this._cart()?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  );
  readonly cartTotal = computed(() =>
    this._cart()?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0
  );

  constructor(private http: HttpClient) {}

  loadCart(userId: number): Observable<Cart> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Cart>(`${this.base}/cart`, { params }).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  addItem(userId: number, item: Partial<CartItem>): Observable<Cart> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<Cart>(`${this.base}/cart/items`, item, { params }).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  updateItem(itemId: number, quantity: number): Observable<CartItem> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.put<CartItem>(`${this.base}/cart/items/${itemId}`, null, { params }).pipe(
      tap(() => this.patchItemQty(itemId, quantity))
    );
  }

  removeItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/cart/items/${itemId}`).pipe(
      tap(() => {
        const current = this._cart();
        if (current) {
          this._cart.set({ ...current, items: current.items.filter(i => i.id !== itemId) });
        }
      })
    );
  }

  clearCart(userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.delete<void>(`${this.base}/cart`, { params }).pipe(
      tap(() => this.clearLocalCart())
    );
  }

  clearLocalCart(): void {
    this._cart.set(null);
  }

  private patchItemQty(itemId: number, quantity: number): void {
    const current = this._cart();
    if (!current) return;
    this._cart.set({
      ...current,
      items: current.items.map(i => i.id === itemId ? { ...i, quantity } : i),
    });
  }
}
