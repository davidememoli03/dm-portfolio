import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { ThemeToggleComponent } from '../../theme/theme-toggle.component';

@Component({
  selector: 'admin-login-page',
  imports: [ReactiveFormsModule, ThemeToggleComponent],
  template: `
    <div class="absolute top-4 right-4 sm:top-6 sm:right-6">
      <admin-theme-toggle />
    </div>

    <div class="flex min-h-screen items-center justify-center px-4 py-12">
      <div class="glass-strong w-full max-w-md rounded-3xl p-8 sm:p-10">
        <div class="text-center">
          <span class="text-eyebrow text-[var(--color-accent)]">DM Portfolio</span>
          <h1 class="text-headline mt-2 text-[var(--color-text)]">Admin sign in</h1>
          <p class="mt-2 text-sm text-[var(--color-text-muted)]">
            Enter your credentials to access the message inbox.
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 grid gap-5" novalidate>
          <label class="flex flex-col gap-1.5 text-sm">
            <span class="font-medium text-[var(--color-text)]">Username</span>
            <input
              type="text"
              formControlName="username"
              autocomplete="username"
              class="rounded-xl border border-[var(--color-surface-glass-border)] bg-[var(--color-surface-glass)] px-4 py-2.5 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
            />
          </label>

          <label class="flex flex-col gap-1.5 text-sm">
            <span class="font-medium text-[var(--color-text)]">Password</span>
            <input
              type="password"
              formControlName="password"
              autocomplete="current-password"
              class="rounded-xl border border-[var(--color-surface-glass-border)] bg-[var(--color-surface-glass)] px-4 py-2.5 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
            />
          </label>

          @if (errorMessage()) {
            <div
              class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300"
              role="alert"
            >
              {{ errorMessage() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="submitting() || form.invalid"
            class="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-base font-semibold text-[var(--color-accent-fg)] shadow-md transition-transform hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {{ submitting() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.maxLength(200)]],
  });

  readonly status = signal<'idle' | 'submitting' | 'error'>('idle');
  readonly errorMessage = signal<string | null>(null);

  readonly submitting = computed(() => this.status() === 'submitting');

  submit(): void {
    if (this.submitting()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { username, password } = this.form.getRawValue();
    this.status.set('submitting');
    this.errorMessage.set(null);

    this.auth.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/messages']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.errorMessage.set('Invalid username or password.');
        } else if (err.status === 429) {
          this.errorMessage.set('Too many login attempts. Try again later.');
        } else {
          this.errorMessage.set('Could not sign in. Please try again.');
        }
        this.status.set('error');
      },
    });
  }
}
