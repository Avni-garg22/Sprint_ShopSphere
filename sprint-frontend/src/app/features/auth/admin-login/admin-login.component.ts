import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div>
      <!-- Admin badge -->
      <div class="flex items-center gap-2 mb-4">
        <span class="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
          </svg>
          Admin Access
        </span>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-1">Admin Sign In</h2>
      <p class="text-sm text-gray-500 mb-6">Restricted to authorized administrators only</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div class="form-group">
          <label class="label" for="username">Username or email</label>
          <input
            id="username"
            type="text"
            formControlName="username"
            class="input"
            [class.input-error]="isInvalid('username')"
            placeholder="Admin username or email"
            autocomplete="username"
          />
          @if (isInvalid('username')) {
            <p class="error-text">Username or email is required</p>
          }
        </div>

        <div class="form-group">
          <label class="label" for="password">Password</label>
          <div class="relative">
            <input
              id="password"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              class="input pr-10"
              [class.input-error]="isInvalid('password')"
              placeholder="Admin password"
              autocomplete="current-password"
            />
            <button
              type="button"
              (click)="showPassword.set(!showPassword())"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {{ showPassword() ? '🙈' : '👁' }}
            </button>
          </div>
          @if (isInvalid('password')) {
            <p class="error-text">Password is required</p>
          }
        </div>

        @if (errorMsg()) {
          <div class="bg-danger-100 text-danger-700 text-sm px-4 py-3 rounded-lg">
            {{ errorMsg() }}
          </div>
        }

        <button
          type="submit"
          class="btn w-full btn-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
          [disabled]="loading()"
        >
          @if (loading()) {
            <svg class="animate-spin w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Signing in...
          } @else {
            Sign in to Admin Panel
          }
        </button>
      </form>

      <p class="text-center text-sm text-gray-400 mt-6">
        Not an admin?
        <a routerLink="/auth/login" class="text-primary-600 font-medium hover:underline">Customer login</a>
      </p>
    </div>
  `,
})
export class AdminLoginComponent {
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
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        const user = this.auth.currentUser();
        if (user?.role !== 'ADMIN') {
          // Not an admin — log them out and show error
          this.auth.logout();
          this.errorMsg.set('Access denied. This login is for administrators only.');
          return;
        }
        this.toast.success(`Welcome, ${user.username}!`);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Invalid credentials. Please try again.');
      },
    });
  }
}
