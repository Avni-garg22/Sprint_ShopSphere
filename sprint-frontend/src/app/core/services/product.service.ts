import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  // Gateway prefix: /gateway/catalog → service path: /products/**
  private base = `${environment.gatewayCatalog}/products`;

  constructor(private http: HttpClient) {}

  getAll(search?: string, categoryId?: number): Observable<Product[]> {
    let params = new HttpParams();
    if (search)     params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    return this.http.get<Product[]>(this.base, { params });
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.gatewayCatalog}/featured`);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(product: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  update(id: number, product: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
