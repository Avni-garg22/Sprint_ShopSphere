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
    <div class="min-h-screen flex flex-col">
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
