import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

import { AdminApiService } from '../api/admin-api.service';
import { AdminUser } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AdminApiService);

  private readonly userSignal = signal<AdminUser | null>(null);
  private readonly readySignal = signal(false);

  readonly user = this.userSignal.asReadonly();
  readonly ready = this.readySignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  bootstrap(): Observable<AdminUser | null> {
    return this.api.me().pipe(
      tap((user) => {
        this.userSignal.set(user);
        this.readySignal.set(true);
      }),
      catchError(() => {
        this.userSignal.set(null);
        this.readySignal.set(true);
        return of(null);
      }),
    );
  }

  login(username: string, password: string): Observable<AdminUser> {
    return this.api.login({ username, password }).pipe(
      tap((res) => this.userSignal.set({ username: res.username })),
      catchError((err) => {
        this.userSignal.set(null);
        throw err;
      }),
    ) as unknown as Observable<AdminUser>;
  }

  logout(): Observable<void> {
    return this.api.logout().pipe(
      tap(() => this.userSignal.set(null)),
      catchError(() => {
        this.userSignal.set(null);
        return of(undefined);
      }),
    );
  }
}
