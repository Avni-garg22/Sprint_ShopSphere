import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, RazorpayOrderResponse, RazorpayVerifyRequest } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  // Gateway prefix: /gateway/payment → service path: /api/payment/**
  private base = `${environment.gatewayPayment}/api/payment`;

  constructor(private http: HttpClient) {}

  getByOrderId(orderId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/${orderId}`);
  }

  process(orderId: number, amount: number, mode: string): Observable<Payment> {
    return this.http.post<Payment>(`${environment.gatewayOrders}/payment`, { orderId, amount, mode });
  }

  createRazorpayOrder(orderId: number, amount: number): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>(`${this.base}/razorpay/order`, { orderId, amount });
  }

  verifyRazorpayPayment(payload: RazorpayVerifyRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.base}/razorpay/verify`, payload);
  }
}
