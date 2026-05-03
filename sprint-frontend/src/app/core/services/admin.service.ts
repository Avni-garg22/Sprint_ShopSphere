import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductRequest } from '../models/product.model';
import { Order } from '../models/order.model';

export interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private productBase = `${environment.gatewayCatalog}/products`;
  private adminBase = environment.gatewayAdmin;
  private orderBase = `${this.adminBase}/orders`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.adminBase}/dashboard`);
  }

  getReports(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.adminBase}/reports`);
  }

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productBase);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productBase}/${id}`);
  }

  createProduct(product: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.productBase, product);
  }

  uploadProductImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.productBase}/images`, formData);
  }

  updateProduct(id: number, product: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.productBase}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productBase}/${id}`);
  }

  // Orders
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.orderBase);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Order>(`${this.orderBase}/${id}/status`, null, { params });
  }
}
