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
    <nav class="sticky top-0 z-30 border-b border-white/60 bg-white/75 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <a routerLink="/" class="group flex items-center gap-3 text-xl font-black text-slate-950">
            <div class="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-slate-950 shadow-lg shadow-teal-700/20">
              <div class="absolute inset-0 bg-gradient-to-br from-teal-300 via-sky-400 to-amber-300 opacity-80 transition-transform duration-500 group-hover:scale-125"></div>
              <span class="relative text-sm font-black text-white">S</span>
            </div>
            <span>ShopSphere</span>
          </a>

          <div class="hidden items-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 shadow-sm backdrop-blur md:flex">
            <a routerLink="/" routerLinkActive="bg-white text-primary-700 shadow-sm"
               [routerLinkActiveOptions]="{exact:true}"
               class="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-950 hover:shadow-sm">
              Home
            </a>
            <a routerLink="/products" routerLinkActive="bg-white text-primary-700 shadow-sm"
               class="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-950 hover:shadow-sm">
              Products
            </a>
            @if (isLoggedIn() && !isAdmin()) {
              <a routerLink="/orders" routerLinkActive="bg-white text-primary-700 shadow-sm"
                 class="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-950 hover:shadow-sm">
                Orders
              </a>
            }
            @if (isAdmin()) {
              <a routerLink="/admin/dashboard" routerLinkActive="bg-white text-primary-700 shadow-sm"
                 class="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-white hover:text-slate-950 hover:shadow-sm">
                Admin
              </a>
            }
          </div>

          <div class="flex items-center gap-3">
            @if (!isAdmin()) {
              <a routerLink="/cart" class="relative rounded-full border border-white/70 bg-white/60 p-2 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:text-primary-600">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                @if (itemCount() > 0) {
                  <span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white shadow-sm">
                    {{ itemCount() > 9 ? '9+' : itemCount() }}
                  </span>
                }
              </a>
            }

            @if (isLoggedIn()) {
              <app-notification-tray />

              <div class="relative">
                <button
                  (click)="menuOpen.set(!menuOpen())"
                  class="flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-2 py-1 text-sm text-slate-700 shadow-sm transition-all hover:bg-white hover:text-primary-600"
                >
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-sky-100">
                    <span class="text-xs font-bold uppercase text-slate-900">
                      {{ username().charAt(0) }}
                    </span>
                  </div>
                  <span class="hidden font-medium sm:block">{{ username() }}</span>
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (menuOpen()) {
                  <div class="absolute right-0 z-50 mt-3 w-52 rounded-2xl border border-white/70 bg-white/85 py-2 shadow-2xl shadow-slate-900/15 backdrop-blur-xl">
                    @if (isAdmin()) {
                      <a routerLink="/admin/dashboard" (click)="menuOpen.set(false)"
                         class="block px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50">
                        Admin Panel
                      </a>
                      <hr class="my-1 border-slate-100">
                    } @else {
                      <a routerLink="/orders" (click)="menuOpen.set(false)"
                         class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Orders</a>
                      <hr class="my-1 border-slate-100">
                    }
                    <button (click)="logout()"
                       class="block w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-red-50">
                      Sign out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/auth/login" class="btn btn-primary btn-sm shadow-lg shadow-primary-600/20">Sign in</a>
            }
          </div>
        </div>
      </div>
    </nav>

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
    this.isAdmin = this.auth.isAdmin;
    this.itemCount = this.cartService.itemCount;
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
