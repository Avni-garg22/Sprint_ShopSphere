import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-category-table',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, ConfirmDialogComponent],
  template: `
    <div class="page-container">
      <div class="flex items-center justify-between mb-6">
        <h1 class="section-title mb-0">Categories</h1>
        <a routerLink="/admin/categories/new" class="btn btn-primary">+ Add Category</a>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (categories().length === 0) {
        <div class="text-center py-16 text-gray-400">No categories found.</div>
      } @else {
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                  <th class="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                  <th class="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (cat of categories(); track cat.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 text-gray-600">#{{ cat.id }}</td>
                    <td class="px-6 py-4 font-medium text-gray-900">{{ cat.name }}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                      <a [routerLink]="['/admin/categories', cat.id, 'edit']"
                         class="text-primary-600 hover:underline text-xs font-medium">Edit</a>
                      <button (click)="confirmDelete(cat)"
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
      title="Delete category"
      [message]="'Delete ' + pendingDelete()?.name + '?'"
      confirmLabel="Delete"
      (confirm)="deleteCategory()"
      (cancel)="showConfirm.set(false)"
    />
  `,
})
export class CategoryTableComponent implements OnInit {
  categories    = signal<Category[]>([]);
  loading       = signal(true);
  showConfirm   = signal(false);
  pendingDelete = signal<Category | null>(null);

  constructor(private categoryService: CategoryService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: c => { this.categories.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  confirmDelete(cat: Category): void {
    this.pendingDelete.set(cat);
    this.showConfirm.set(true);
  }

  deleteCategory(): void {
    const id = this.pendingDelete()?.id;
    if (!id) return;
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.toast.success('Category deleted');
        this.showConfirm.set(false);
        this.loadCategories();
      },
      error: () => {
        this.toast.error('Failed to delete category');
        this.showConfirm.set(false);
      },
    });
  }
}
