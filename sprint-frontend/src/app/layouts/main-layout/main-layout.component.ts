import { Component, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <div class="relative min-h-screen flex flex-col overflow-hidden">
      <div class="pointer-events-none fixed inset-0 -z-10">
        <div class="absolute left-8 top-24 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl"></div>
        <div class="absolute right-0 top-40 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl"></div>
        <div class="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl"></div>
      </div>
      @if (!isAdminRoute()) {
        <app-navbar />
      }
      <main class="flex-1">
        <router-outlet />
      </main>
      @if (!isAdminRoute()) {
        <app-footer />
      }
      <app-toast />
    </div>
  `,
})
export class MainLayoutComponent {
  isAdminRoute = computed(() => this.router.url.startsWith('/admin'));

  constructor(private router: Router) {}
}
