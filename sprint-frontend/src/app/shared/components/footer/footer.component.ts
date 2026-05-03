import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <a routerLink="/" class="flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors">
            <div class="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white text-xs font-bold">S</span>
            </div>
            ShopSphere
          </a>

          <div class="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <a routerLink="/" routerLinkActive="text-primary-600 font-semibold"
               [routerLinkActiveOptions]="{exact:true}"
               class="hover:text-primary-600 transition-colors">
              Home
            </a>
            <a routerLink="/products" routerLinkActive="text-primary-600 font-semibold"
               class="hover:text-primary-600 transition-colors">
              Products
            </a>
            @if (isLoggedIn() && !isAdmin()) {
              <a routerLink="/orders" routerLinkActive="text-primary-600 font-semibold"
                 class="hover:text-primary-600 transition-colors">
                Orders
              </a>
            }
            @if (isAdmin()) {
              <a routerLink="/admin/dashboard" routerLinkActive="text-primary-600 font-semibold"
                 class="hover:text-primary-600 transition-colors">
                Admin
              </a>
            }
            @if (!isLoggedIn()) {
              <a routerLink="/auth/login" class="hover:text-primary-600 transition-colors">
                Sign in
              </a>
            }
          </div>

          <p class="text-xs text-gray-400">&copy; 2026 ShopSphere. All rights reserved.</p>
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
