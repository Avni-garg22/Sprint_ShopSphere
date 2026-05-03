import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;

  router.navigate(['/']);
  return false;
};

export const customerGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAdmin()) return true;

  router.navigate([state.url.startsWith('/orders') ? '/admin/orders' : '/admin/dashboard']);
  return false;
};
