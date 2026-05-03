import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderResponse } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  // Gateway prefix: /gateway/orders → service path: /orders/**
  private base = environment.gatewayOrders;

  constructor(private http: HttpClient) {}

  placeOrder(order: Order): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.base}/place`, order);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  getMyOrders(userId: number): Observable<Order[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Order[]>(`${this.base}/my`, { params });
  }
}
