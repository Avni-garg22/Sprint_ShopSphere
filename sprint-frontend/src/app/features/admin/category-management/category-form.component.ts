import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
  template: `
    <div class="page-container max-w-2xl">
      <a routerLink="/admin/categories" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        ← Back to Categories
      </a>
      <h1 class="section-title">{{ isEdit ? 'Edit Category' : 'Add Category' }}</h1>

      @if (loading()) {
        <app-spinner />
      } @else {
        <div class="card p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

            <div class="form-group">
              <label class="label">Category Name</label>
              <input type="text" formControlName="name" class="input"
                [class.input-error]="isInvalid('name')" placeholder="Enter category name"/>
              @if (isInvalid('name')) { <p class="error-text">Name is required (2-100 chars)</p> }
            </div>

            @if (errorMsg()) {
              <div class="bg-danger-100 text-danger-700 text-sm px-4 py-3 rounded-lg">{{ errorMsg() }}</div>
            }

            <div class="flex gap-4 pt-2">
              <a routerLink="/admin/categories" class="btn btn-secondary flex-1">Cancel</a>
              <button type="submit" class="btn btn-primary flex-1" [disabled]="saving()">
                {{ saving() ? 'Saving...' : (isEdit ? 'Update Category' : 'Add Category') }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  form!: FormGroup;
  isEdit   = false;
  loading  = signal(false);
  saving   = signal(false);
  errorMsg = signal('');
  private categoryId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.categoryId = Number(id);
      this.loading.set(true);
      this.categoryService.getById(this.categoryId).subscribe({
        next: c => {
          this.form.patchValue(c);
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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set('');

    const req = this.isEdit && this.categoryId
      ? this.categoryService.update(this.categoryId, this.form.value)
      : this.categoryService.create(this.form.value);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.isEdit ? 'Category updated' : 'Category created');
        this.router.navigate(['/admin/categories']);
      },
      error: (err: Error) => {
        this.saving.set(false);
        this.errorMsg.set(err.message || 'Failed to save category');
      },
    });
  }
}
