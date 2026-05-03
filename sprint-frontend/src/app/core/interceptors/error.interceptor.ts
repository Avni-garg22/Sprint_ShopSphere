import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthRoute = req.url.includes('/auth/');

      if (err.status === 401 && !isAuthRoute) {
        // Token expired or missing — log out and redirect to login
        auth.logout();
        router.navigate(['/auth/login']);
      } else if (err.status === 403 && !isAuthRoute) {
        // Forbidden on a protected route — go home
        router.navigate(['/']);
      }

      // Extract the most useful error message from the response
      const message =
        err.error?.message ??
        err.error?.error ??
        (typeof err.error === 'string' ? err.error : null) ??
        err.message ??
        'An unexpected error occurred';

      return throwError(() => new Error(message));
    })
  );
};
