import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationTrayComponent } from '../../../shared/components/notification-tray/notification-tray.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationTrayComponent],
  template: `
    <div class="flex min-h-screen bg-slate-100">
      <aside class="w-72 bg-slate-950 text-white flex-shrink-0 hidden md:flex flex-col">
        <div class="p-6 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              A
            </div>
            <div>
              <p class="text-xs text-amber-300 uppercase tracking-widest font-semibold">Operations</p>
              <h2 class="text-lg font-bold leading-tight">Admin Console</h2>
            </div>
          </div>
          <div class="mt-5 rounded-lg bg-slate-900 border border-slate-800 p-3">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Access mode</p>
            <p class="mt-1 text-sm text-slate-100">Monitor, manage, and audit activity</p>
          </div>
        </div>

        <nav class="flex-1 p-4 space-y-1">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-amber-500 text-slate-950"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <span class="w-8 h-8 rounded-md border border-current/20 flex items-center justify-center text-xs font-bold">
                {{ item.code }}
              </span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="p-4 border-t border-slate-800">
          <a routerLink="/products" class="flex items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white">
            View storefront
          </a>
        </div>
      </aside>

      <main class="flex-1 overflow-auto">
        <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Admin</p>
            <h1 class="text-base font-bold text-slate-950">Operations Console</h1>
          </div>
          <div class="flex items-center gap-4">
            <app-notification-tray />
            <div class="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold uppercase">
                {{ username().charAt(0) || 'A' }}
              </span>
              <span class="font-medium">{{ username() || 'Admin' }}</span>
            </div>
            <button
              type="button"
              (click)="logout()"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  username = computed(() => this.auth.currentUser()?.username ?? '');

  constructor(private auth: AuthService) {}

  navItems = [
    { path: '/admin/dashboard',    label: 'Command Center', code: 'OV', exact: true },
    { path: '/admin/products',     label: 'Products',       code: 'PR' },
    { path: '/admin/categories',   label: 'Categories',     code: 'CA' },
    { path: '/admin/orders',       label: 'Orders',         code: 'OR' },
    { path: '/admin/reports',      label: 'Reports',        code: 'RP' },
    { path: '/admin/create-admin', label: 'Create Admin',   code: 'AD' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
