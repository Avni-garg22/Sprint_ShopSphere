import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, ConfirmDialogComponent, CurrencyFormatPipe],
  template: `
    <div class="page-container">
      <div class="flex items-center justify-between mb-6">
        <h1 class="section-title mb-0">Products</h1>
        <a routerLink="/admin/products/new" class="btn btn-primary">+ Add Product</a>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (products().length === 0) {
        <div class="text-center py-16 text-gray-400">No products found.</div>
      } @else {
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Image</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Price</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Stock</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                  <th class="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (product of products(); track product.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="h-12 w-12 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        @if (product.imageUrl) {
                          <img [src]="imageSrc(product.imageUrl)" [alt]="product.name" class="h-full w-full object-cover" />
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">#{{ product.id }}</td>
                    <td class="px-6 py-4 font-medium text-gray-900">{{ product.name }}</td>
                    <td class="px-6 py-4 text-gray-900">{{ product.price | currencyFormat }}</td>
                    <td class="px-6 py-4" [class]="product.stock > 0 ? 'text-success-600' : 'text-danger-600'">
                      {{ product.stock }}
                    </td>
                    <td class="px-6 py-4 text-gray-600">{{ product.category?.name ?? '—' }}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                      <a [routerLink]="['/admin/products', product.id, 'edit']"
                         class="text-primary-600 hover:underline text-xs font-medium">Edit</a>
                      <button (click)="confirmDelete(product)"
                              class="text-danger-600 hover:underline text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [visible]="showConfirm()"
      title="Delete product"
      [message]="'Delete ' + pendingDelete()?.name + '?'"
      confirmLabel="Delete"
      (confirm)="deleteProduct()"
      (cancel)="showConfirm.set(false)"
    />
  `,
})
export class ProductTableComponent implements OnInit {
  products      = signal<Product[]>([]);
  loading       = signal(true);
  showConfirm   = signal(false);
  pendingDelete = signal<Product | null>(null);

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.adminService.getProducts().subscribe({
      next: p => { this.products.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  confirmDelete(product: Product): void {
    this.pendingDelete.set(product);
    this.showConfirm.set(true);
  }

  deleteProduct(): void {
    const p = this.pendingDelete();
    if (!p) return;
    this.adminService.deleteProduct(p.id).subscribe({
      next: () => {
        this.toast.success('Product deleted');
        this.showConfirm.set(false);
        this.loadProducts();
      },
      error: () => this.toast.error('Failed to delete product'),
    });
  }

  imageSrc(imageUrl: string): string {
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    if (imageUrl.startsWith('/gateway/')) return `${environment.apiUrl}${imageUrl}`;
    if (imageUrl.startsWith('/uploads/')) return `${environment.catalogAssets}${imageUrl}`;
    return imageUrl;
  }
}
