import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
  template: `
    <div class="page-container max-w-2xl">
      <a routerLink="/admin/products" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        ← Back to Products
      </a>
      <h1 class="section-title">{{ isEdit ? 'Edit Product' : 'Add Product' }}</h1>

      @if (loading()) {
        <app-spinner />
      } @else {
        <div class="card p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

            <div class="form-group">
              <label class="label">Product Name</label>
              <input type="text" formControlName="name" class="input"
                [class.input-error]="isInvalid('name')" placeholder="Enter product name"/>
              @if (isInvalid('name')) { <p class="error-text">Name is required (2-100 chars)</p> }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="label">Price (₹)</label>
                <input type="number" formControlName="price" class="input"
                  [class.input-error]="isInvalid('price')" placeholder="0.00" step="0.01"/>
                @if (isInvalid('price')) { <p class="error-text">Price must be greater than 0</p> }
              </div>
              <div class="form-group">
                <label class="label">Stock</label>
                <input type="number" formControlName="stock" class="input"
                  [class.input-error]="isInvalid('stock')" placeholder="0"/>
                @if (isInvalid('stock')) { <p class="error-text">Stock cannot be negative</p> }
              </div>
            </div>

            <div class="form-group">
              <label class="label">Description</label>
              <textarea formControlName="description" class="input h-24 resize-none"
                placeholder="Product description (max 500 chars)"></textarea>
            </div>

            <div class="form-group">
              <label class="label">Product Image</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                class="input file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
                [class.input-error]="imageRequiredError()"
                (change)="onImageSelected($event)"
              />
              @if (imageRequiredError()) {
                <p class="error-text">Product image is required</p>
              }
              @if (imagePreview()) {
                <div class="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img [src]="imagePreview()" alt="Selected product image preview" class="h-48 w-full object-contain" />
                </div>
              }
            </div>

            <div class="form-group">
              <label class="label">Category</label>
              @if (categories().length === 0) {
                <div class="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg mb-3">
                  <p class="font-medium">No categories available</p>
                  <p class="text-xs mt-1">
                    <a routerLink="/admin/categories" class="underline hover:no-underline font-semibold">
                      Create categories first
                    </a>
                    before adding products.
                  </p>
                </div>
                <select formControlName="categoryId" class="input" [disabled]="true">
                  <option [value]="null">-- No Categories Available --</option>
                </select>
              } @else {
                <select formControlName="categoryId" class="input">
                  <option [value]="null">-- Select Category --</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              }
            </div>

            <div class="flex items-center gap-2">
              <input type="checkbox" formControlName="featured" id="featured"
                     class="w-4 h-4 text-primary-600 rounded border-gray-300"/>
              <label for="featured" class="text-sm font-medium text-gray-700">Featured product</label>
            </div>

            @if (errorMsg()) {
              <div class="bg-danger-100 text-danger-700 text-sm px-4 py-3 rounded-lg">{{ errorMsg() }}</div>
            }

            <div class="flex gap-4 pt-2">
              <a routerLink="/admin/products" class="btn btn-secondary flex-1">Cancel</a>
              <button type="submit" class="btn btn-primary flex-1" [disabled]="saving()">
                {{ saving() ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product') }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  isEdit   = false;
  loading  = signal(false);
  saving   = signal(false);
  errorMsg = signal('');
  categories = signal<Category[]>([]);
  imagePreview = signal<string | null>(null);
  private selectedImageFile: File | null = null;
  private imageTouched = false;
  private productId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private categoryService: CategoryService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      price:       [null, [Validators.required, Validators.min(0.01)]],
      stock:       [0,    [Validators.required, Validators.min(0)]],
      description: [''],
      imageUrl:    [''],
      categoryId:  [null],
      featured:    [false],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.productId = Number(id);
      this.loading.set(true);
      this.adminService.getProduct(this.productId).subscribe({
        next: p => {
          this.form.patchValue({ ...p, categoryId: p.category?.id ?? null });
          this.imagePreview.set(this.resolveImageUrl(p.imageUrl));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  submit(): void {
    this.imageTouched = true;
    if (this.form.invalid || this.imageRequiredError()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set('');

    if (this.selectedImageFile) {
      this.adminService.uploadProductImage(this.selectedImageFile).subscribe({
        next: ({ imageUrl }) => this.saveProduct(imageUrl),
        error: (err: Error) => {
          this.saving.set(false);
          this.errorMsg.set(err.message || 'Failed to upload product image');
        },
      });
      return;
    }

    this.saveProduct(this.form.value.imageUrl?.trim() || null);
  }

  onImageSelected(event: Event): void {
    this.imageTouched = true;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImageFile = file;

    if (!file) {
      this.imagePreview.set(this.resolveImageUrl(this.form.value.imageUrl));
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
      this.selectedImageFile = null;
      input.value = '';
      this.imagePreview.set(this.resolveImageUrl(this.form.value.imageUrl));
      this.errorMsg.set('Only JPG, PNG, WEBP, and GIF images are allowed');
      return;
    }

    this.errorMsg.set('');
    this.imagePreview.set(URL.createObjectURL(file));
  }

  imageRequiredError(): boolean {
    return this.imageTouched && !this.isEdit && !this.selectedImageFile;
  }

  private saveProduct(imageUrl: string | null): void {
    const { categoryId, ...payload } = this.form.value;
    payload.imageUrl = imageUrl;
    
    if (categoryId) {
      payload.category = { id: categoryId };
    } else {
      payload.category = null;
    }

    const req = this.isEdit && this.productId
      ? this.adminService.updateProduct(this.productId, payload)
      : this.adminService.createProduct(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.isEdit ? 'Product updated' : 'Product created');
        this.router.navigate(['/admin/products']);
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.errorMsg.set(err.message || 'Failed to save product');
      },
    });
  }

  private resolveImageUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    if (imageUrl.startsWith('/gateway/')) return `${environment.apiUrl}${imageUrl}`;
    if (imageUrl.startsWith('/uploads/')) return `${environment.catalogAssets}${imageUrl}`;
    return imageUrl;
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories.set(cats);
      },
      error: () => {
        this.toast.error('Failed to load categories');
      },
    });
  }
}
