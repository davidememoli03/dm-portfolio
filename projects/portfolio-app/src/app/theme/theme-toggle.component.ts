import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ThemeService } from './theme.service';
import { THEME_OPTIONS, ThemePreference } from './theme';

@Component({
  selector: 'app-theme-toggle',
  imports: [TranslateModule],
  template: `
    <div
      class="glass inline-flex items-center gap-0.5 rounded-full p-1"
      role="group"
      [attr.aria-label]="'theme.label' | translate"
    >
      @for (option of options; track option) {
        @let active = option === current();
        <button
          type="button"
          class="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          [class]="
            active
              ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]'
          "
          [attr.aria-pressed]="active"
          [attr.aria-label]="'theme.' + option | translate"
          [attr.title]="'theme.' + option | translate"
          [disabled]="active"
          (click)="select(option)"
        >
          @switch (option) {
            @case ('system') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            }
            @case ('light') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            }
            @case ('dark') {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            }
          }
        </button>
      }
    </div>
  `,
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  readonly options = THEME_OPTIONS;
  readonly current = this.themeService.preference;

  select(option: ThemePreference): void {
    this.themeService.setPreference(option);
  }
}
