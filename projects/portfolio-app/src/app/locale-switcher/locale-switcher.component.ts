import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SUPPORTED_LOCALES, storeLanguage } from '../i18n/locales';

@Component({
  selector: 'app-locale-switcher',
  imports: [TranslateModule],
  template: `
    <div
      class="glass inline-flex items-center gap-1 rounded-full p-1"
      role="group"
      aria-label="Language"
    >
      @for (locale of locales; track locale.code) {
        @let active = locale.code === currentLanguage;
        <button
          type="button"
          class="relative min-h-[36px] min-w-[44px] rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          [class]="
            active
              ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]'
          "
          [attr.aria-pressed]="active"
          [attr.aria-label]="locale.code"
          [attr.lang]="locale.code"
          [disabled]="active"
          (click)="switchLanguage(locale.code)"
        >
          {{ locale.label }}
        </button>
      }
    </div>
  `,
})
export class LocaleSwitcherComponent {
  private readonly translate = inject(TranslateService);

  readonly locales = SUPPORTED_LOCALES;
  currentLanguage = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'it';

  switchLanguage(language: string): void {
    if (language === this.currentLanguage) {
      return;
    }

    storeLanguage(language);
    this.translate.use(language).subscribe(() => {
      this.currentLanguage = language;
    });
  }
}
