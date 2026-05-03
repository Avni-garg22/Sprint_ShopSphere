import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <footer class="mt-auto border-t border-white/60 bg-slate-950 text-white">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr] md:items-start">
          <div>
            <a routerLink="/" class="flex items-center gap-3 text-xl font-black">
              <div class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white">
                <div class="absolute inset-0 bg-gradient-to-br from-teal-300 via-sky-400 to-amber-300"></div>
                <span class="relative text-sm font-black text-slate-950">S</span>
              </div>
              ShopSphere
            </a>
            <p class="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              A fresher storefront for fast browsing, confident checkout, and clean order tracking.
            </p>
            <div class="mt-5 flex flex-wrap gap-2">
              <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">Secure checkout</span>
              <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">Live catalog</span>
              <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">Order updates</span>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold uppercase text-slate-400">Explore</h3>
            <div class="mt-4 grid gap-3 text-sm">
              <a routerLink="/" routerLinkActive="text-teal-300"
                 [routerLinkActiveOptions]="{exact:true}"
                 class="text-slate-200 transition-colors hover:text-white">
                Home
              </a>
              <a routerLink="/products" routerLinkActive="text-teal-300"
                 class="text-slate-200 transition-colors hover:text-white">
                Products
              </a>
              @if (isLoggedIn() && !isAdmin()) {
                <a routerLink="/orders" routerLinkActive="text-teal-300"
                   class="text-slate-200 transition-colors hover:text-white">
                  Orders
                </a>
              }
              @if (isAdmin()) {
                <a routerLink="/admin/dashboard" routerLinkActive="text-teal-300"
                   class="text-slate-200 transition-colors hover:text-white">
                  Admin
                </a>
              }
              @if (!isLoggedIn()) {
                <a routerLink="/auth/login" class="text-slate-200 transition-colors hover:text-white">
                  Sign in
                </a>
              }
            </div>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p class="text-sm font-semibold text-white">Weekend drop</p>
            <p class="mt-2 text-sm leading-6 text-slate-300">New arrivals rotate into featured products, so the homepage keeps feeling alive.</p>
            <a routerLink="/products" class="mt-4 inline-flex text-sm font-semibold text-teal-300 hover:text-teal-200">
              Browse catalog
            </a>
          </div>
        </div>

        <div class="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 ShopSphere. All rights reserved.</p>
          <p>Built for responsive shopping across desktop and mobile.</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;

  constructor(private auth: AuthService) {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.isAdmin = this.auth.isAdmin;
  }
}
