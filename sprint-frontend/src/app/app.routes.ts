import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, customerGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth layout routes
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'admin-login',
        loadComponent: () =>
          import('./features/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Main layout routes
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/catalog/product-list/product-list.component').then(m => m.ProductListComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
      },
      {
        path: 'cart',
        canActivate: [authGuard, customerGuard],
        loadComponent: () =>
          import('./features/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: 'checkout',
        canActivate: [authGuard, customerGuard],
        loadComponent: () =>
          import('./features/orders/checkout/checkout.component').then(m => m.CheckoutComponent),
      },
      {
        path: 'orders',
        canActivate: [authGuard, customerGuard],
        loadComponent: () =>
          import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent),
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard, customerGuard],
        loadComponent: () =>
          import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
      },
      {
        path: 'orders/:id/confirmation',
        canActivate: [authGuard, customerGuard],
        loadComponent: () =>
          import('./features/orders/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
      },
      // Admin area
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
          },
          {
            path: 'reports',
            loadComponent: () =>
              import('./features/admin/reports/reports.component').then(m => m.ReportsComponent),
          },
          {
            path: 'products',
            loadComponent: () =>
              import('./features/admin/product-management/product-table.component').then(m => m.ProductTableComponent),
          },
          {
            path: 'products/new',
            loadComponent: () =>
              import('./features/admin/product-management/product-form.component').then(m => m.ProductFormComponent),
          },
          {
            path: 'products/:id/edit',
            loadComponent: () =>
              import('./features/admin/product-management/product-form.component').then(m => m.ProductFormComponent),
          },
          {
            path: 'categories',
            loadComponent: () =>
              import('./features/admin/category-management/category-table.component').then(m => m.CategoryTableComponent),
          },
          {
            path: 'categories/new',
            loadComponent: () =>
              import('./features/admin/category-management/category-form.component').then(m => m.CategoryFormComponent),
          },
          {
            path: 'categories/:id/edit',
            loadComponent: () =>
              import('./features/admin/category-management/category-form.component').then(m => m.CategoryFormComponent),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/admin/order-management/order-table.component').then(m => m.OrderTableComponent),
          },
          {
            path: 'create-admin',
            loadComponent: () =>
              import('./features/auth/admin-register/admin-register.component').then(m => m.AdminRegisterComponent),
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
