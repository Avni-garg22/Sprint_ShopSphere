import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Routes that must never have a token attached
const PUBLIC_URLS = ['/auth/signup', '/auth/login', '/auth/admin-login'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  // Don't attach token to public auth endpoints
  const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));
  if (!token || isPublic) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(cloned);
};
