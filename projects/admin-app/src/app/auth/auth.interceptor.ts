import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const isApi = req.url.startsWith('/api/');
  const cloned = isApi ? req.clone({ withCredentials: true }) : req;

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(cloned).pipe(
    catchError((err) => {
      if (
        isApi &&
        err.status === 401 &&
        !req.url.endsWith('/api/admin/auth/login') &&
        !req.url.endsWith('/api/admin/auth/me')
      ) {
        auth.logout().subscribe();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
