import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationTrayComponent } from '../notification-tray/notification-tray.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NotificationTrayComponent],
  template: `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Brand -->
          <a routerLink="/" class="flex items-center gap-2 font-bold text-xl text-primary-600">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white text-sm font-bold">S</span>
            </div>
            ShopSphere
          </a>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-6">
            <a routerLink="/" routerLinkActive="text-primary-600 font-semibold"
               [routerLinkActiveOptions]="{exact:true}"
               class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </a>
            <a routerLink="/products" routerLinkActive="text-primary-600 font-semibold"
               class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Products
            </a>
            @if (isLoggedIn() && !isAdmin()) {
              <a routerLink="/orders" routerLinkActive="text-primary-600 font-semibold"
                 class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Orders
              </a>
            }
            @if (isAdmin()) {
              <a routerLink="/admin/dashboard" routerLinkActive="text-primary-600 font-semibold"
                 class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Admin
              </a>
            }
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-3">
            <!-- Cart -->
            @if (!isAdmin()) {
            <a routerLink="/cart" class="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              @if (itemCount() > 0) {
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {{ itemCount() > 9 ? '9+' : itemCount() }}
                </span>
              }
            </a>
            }

            @if (isLoggedIn()) {
              <app-notification-tray />

              <!-- User menu -->
              <div class="relative">
                <button
                  (click)="menuOpen.set(!menuOpen())"
                  class="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-700 font-semibold text-xs uppercase">
                      {{ username().charAt(0) }}
                    </span>
                  </div>
                  <span class="hidden sm:block font-medium">{{ username() }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (menuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    @if (isAdmin()) {
                      <a routerLink="/admin/dashboard" (click)="menuOpen.set(false)"
                         class="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 font-medium hover:bg-amber-50">
                        <span>📊</span> Admin Panel
                      </a>
                      <hr class="my-1 border-gray-100">
                    } @else {
                      <a routerLink="/orders" (click)="menuOpen.set(false)"
                         class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</a>
                      <hr class="my-1 border-gray-100">
                    }
                    <button (click)="logout()"
                       class="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-red-50">
                      Sign out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/auth/login" class="btn btn-primary btn-sm">Sign in</a>
            }
          </div>
        </div>
      </div>
    </nav>

    <!-- Backdrop to close menu -->
    @if (menuOpen()) {
      <div class="fixed inset-0 z-20" (click)="menuOpen.set(false)"></div>
    }
  `,
})
export class NavbarComponent {
  menuOpen = signal(false);

  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
  itemCount: () => number;
  username = computed(() => this.auth.currentUser()?.username ?? '');

  constructor(private auth: AuthService, private cartService: CartService) {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.isAdmin    = this.auth.isAdmin;
    this.itemCount  = this.cartService.itemCount;
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
