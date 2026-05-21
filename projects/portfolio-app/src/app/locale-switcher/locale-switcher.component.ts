import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArcadeSoundDirective } from '@davide03memoli/arcade-ui/angular';

import { SUPPORTED_LOCALES, storeLanguage } from '../i18n/locales';

@Component({
  selector: 'app-locale-switcher',
  imports: [TranslateModule, ArcadeSoundDirective],
  template: `
    <div class="arc-panel arc-panel-cyan inline-flex p-1 gap-1">
      @for (locale of locales; track locale.code) {
        @if (locale.code === currentLanguage) {
          <span class="arc-btn arc-btn-primary arc-btn-sm" [attr.aria-current]="'true'">
            {{ locale.label }}
          </span>
        } @else {
          <button
            type="button"
            class="arc-btn arc-btn-ghost arc-btn-sm"
            arcadeSoundClick="select"
            [attr.lang]="locale.code"
            (click)="switchLanguage(locale.code)"
          >
            {{ locale.label }}
          </button>
        }
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
