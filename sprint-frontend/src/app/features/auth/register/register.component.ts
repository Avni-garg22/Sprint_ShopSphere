import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
      <p class="text-sm text-gray-500 mb-6">Join ShopSphere and start shopping</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

        <div class="form-group">
          <label class="label">Username</label>
          <input type="text" formControlName="username" class="input"
            [class.input-error]="isInvalid('username')"
            placeholder="3–20 chars, letters/numbers/_" autocomplete="username"/>
          @if (isInvalid('username')) {
            <p class="error-text">{{ getError('username') }}</p>
          }
        </div>

        <div class="form-group">
          <label class="label">Email</label>
          <input type="email" formControlName="email" class="input"
            [class.input-error]="isInvalid('email')"
            placeholder="you@example.com" autocomplete="email"/>
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

        @if (errorMsg()) {
          <div class="bg-danger-100 text-danger-700 text-sm px-4 py-3 rounded-lg">
            {{ errorMsg() }}
          </div>
        }

        <button type="submit" class="btn btn-primary w-full btn-lg" [disabled]="loading()">
          @if (loading()) { Creating account... } @else { Create account }
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        Already have an account?
        <a routerLink="/auth/login" class="text-primary-600 font-medium hover:underline">Sign in</a>
      </p>
    </div>
  `,
})
export class RegisterComponent {
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
    return 'Invalid value';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    // Public signup always registers as CUSTOMER
    const payload = { ...this.form.value, role: 'CUSTOMER' };

    this.auth.signup(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Account created! Please sign in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Registration failed. Please try again.');
      },
    });
  }
}
