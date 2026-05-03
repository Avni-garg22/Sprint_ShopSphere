import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container max-w-lg">
      <a routerLink="/admin/dashboard"
         class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6">
        ← Back to Dashboard
      </a>

      <div class="card p-8">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Create Admin Account</h1>
            <p class="text-sm text-gray-500">Add a new administrator to the system</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

          <div class="form-group">
            <label class="label">Username</label>
            <input type="text" formControlName="username" class="input"
              [class.input-error]="isInvalid('username')"
              placeholder="3–20 chars, letters/numbers/_" autocomplete="off"/>
            @if (isInvalid('username')) {
              <p class="error-text">{{ getError('username') }}</p>
            }
          </div>

          <div class="form-group">
            <label class="label">Email</label>
            <input type="email" formControlName="email" class="input"
              [class.input-error]="isInvalid('email')"
              placeholder="admin@admin.com" autocomplete="off"/>
            @if (isInvalid('email')) {
              <p class="error-text">{{ getError('email') }}</p>
            }
          </div>

          <div class="form-group">
            <label class="label">Password</label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'"
                formControlName="password" class="input pr-10"
                [class.input-error]="isInvalid('password')"
                placeholder="Min 6 chars, 1 uppercase, 1 number" autocomplete="new-password"/>
              <button type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {{ showPassword() ? '🙈' : '👁' }}
              </button>
            </div>
            @if (isInvalid('password')) {
              <p class="error-text">{{ getError('password') }}</p>
            }
          </div>

          <!-- Role selector — admin can create ADMIN or USER (staff) accounts -->
          <div class="form-group">
            <label class="label">Role</label>
            <select formControlName="role" class="input" [class.input-error]="isInvalid('role')">
              <option value="ADMIN">Admin</option>
              <option value="USER">Staff / User</option>
            </select>
            @if (isInvalid('role')) {
              <p class="error-text">Please select a role</p>
            }
          </div>

          @if (errorMsg()) {
            <div class="bg-danger-100 text-danger-700 text-sm px-4 py-3 rounded-lg">
              {{ errorMsg() }}
            </div>
          }

          <div class="flex gap-3 pt-2">
            <a routerLink="/admin/dashboard" class="btn btn-secondary flex-1">Cancel</a>
            <button type="submit"
              class="btn flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
              [disabled]="loading()">
              {{ loading() ? 'Creating...' : 'Create Account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AdminRegisterComponent {
  form: FormGroup;
  loading      = signal(false);
  errorMsg     = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20),
                      Validators.pattern('^[a-zA-Z0-9_]+$')]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6),
                      Validators.pattern('^(?=.*[A-Z])(?=.*[0-9]).+$')]],
      role:     ['ADMIN', Validators.required],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required'])  return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    if (ctrl.errors['minlength']) return `Too short (min ${ctrl.errors['minlength'].requiredLength} chars)`;
    if (ctrl.errors['maxlength']) return `Too long (max ${ctrl.errors['maxlength'].requiredLength} chars)`;
    if (ctrl.errors['pattern'])   return field === 'password'
      ? 'Must contain at least 1 uppercase letter and 1 number'
      : 'Only letters, numbers and underscores allowed';
    if (ctrl.errors['email'])     return 'Enter a valid email address';
    if (ctrl.errors['adminEmail']) return 'Admin accounts must use an @admin.com email address';
    return 'Invalid value';
  }

  submit(): void {
    this.validateAdminEmail();
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.signup(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Admin account created successfully.');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Failed to create account. Please try again.');
      },
    });
  }

  private validateAdminEmail(): void {
    const emailCtrl = this.form.get('email');
    const role = this.form.get('role')?.value;
    const email = String(emailCtrl?.value || '').toLowerCase();

    if (role === 'ADMIN' && email && !email.endsWith('@admin.com')) {
      emailCtrl?.setErrors({ ...(emailCtrl.errors || {}), adminEmail: true });
      return;
    }

    if (emailCtrl?.errors?.['adminEmail']) {
      const { adminEmail, ...remainingErrors } = emailCtrl.errors;
      emailCtrl.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    }
  }
}
