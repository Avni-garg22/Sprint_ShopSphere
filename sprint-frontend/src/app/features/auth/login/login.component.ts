import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
      <p class="text-sm text-gray-500 mb-6">Sign in to your account</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div class="form-group">
          <label class="label" for="username">Username or email</label>
          <input
            id="username"
            type="text"
            formControlName="username"
            class="input"
            [class.input-error]="isInvalid('username')"
            placeholder="Enter your username or email"
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
              placeholder="Enter your password"
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
          class="btn btn-primary w-full btn-lg"
          [disabled]="loading()"
        >
          @if (loading()) {
            <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Signing in...
          } @else {
            Sign in
          }
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        Don't have an account?
        <a routerLink="/auth/register" class="text-primary-600 font-medium hover:underline">Sign up</a>
      </p>
      <p class="text-center text-sm text-gray-400 mt-2">
        Are you an admin?
        <a routerLink="/auth/admin-login" class="text-gray-500 font-medium hover:underline">Admin login →</a>
      </p>
    </div>
  `,
})
export class LoginComponent {
  form: FormGroup;
  loading  = signal(false);
  errorMsg = signal('');
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        // currentUser() is set synchronously inside storeToken() via tap()
        const user = this.auth.currentUser();
        if (user) {
          this.toast.success(`Welcome back, ${user.username}!`);
          this.router.navigate(['/']);
        } else {
          // Token was not in response header — show error
          this.errorMsg.set('Login succeeded but no token received. Please try again.');
        }
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Invalid credentials. Please try again.');
      },
    });
  }
}
