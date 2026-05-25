import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { ThemeToggleComponent } from '../theme/theme-toggle.component';

@Component({
  selector: 'admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ThemeToggleComponent],
  template: `
    <header class="sticky top-0 z-40 w-full">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-eyebrow text-[var(--color-accent)]">Admin</span>
          <nav class="flex items-center gap-1" aria-label="Admin sections">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
              class="glass inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-accent-soft)]"
            >
              Dashboard
            </a>
            <a
              routerLink="/messages"
              routerLinkActive="bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
              [routerLinkActiveOptions]="{ exact: false }"
              class="glass inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-accent-soft)]"
            >
              Messages
            </a>
            <a
              routerLink="/analytics"
              routerLinkActive="bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
              class="glass inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-accent-soft)]"
            >
              Analytics
            </a>
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <admin-theme-toggle />
          @if (auth.user()) {
            <span class="glass hidden items-center rounded-full px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] sm:inline-flex">
              {{ auth.user()?.username }}
            </span>
          }
          <button
            type="button"
            (click)="logout()"
            class="glass inline-flex min-h-[36px] items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-accent-soft)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <router-outlet />
    </main>
  `,
})
export class AdminShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
