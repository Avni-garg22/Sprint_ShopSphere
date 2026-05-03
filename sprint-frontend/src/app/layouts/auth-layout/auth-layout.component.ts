import { Component, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4"
         [class]="isAdminRoute() ? 'bg-gradient-to-br from-amber-50 to-amber-100' : 'bg-gradient-to-br from-primary-50 to-primary-100'">
      <div class="w-full max-w-md">
        <!-- Logo / Brand -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
               [class]="isAdminRoute() ? 'bg-amber-600' : 'bg-primary-600'">
            @if (isAdminRoute()) {
              <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
              </svg>
            } @else {
              <span class="text-white text-2xl font-bold">S</span>
            }
          </div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isAdminRoute() ? 'ShopSphere Admin' : 'ShopSphere' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ isAdminRoute() ? 'Administration Portal' : 'Your one-stop marketplace' }}
          </p>
        </div>
        <div class="card p-8 shadow-xl">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  isAdminRoute = computed(() => this.router.url.includes('admin-login'));

  constructor(private router: Router) {}
}
