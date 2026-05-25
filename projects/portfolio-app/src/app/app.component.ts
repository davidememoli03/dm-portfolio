import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PortfolioApiService } from 'dm-portfolio';

import { AnalyticsService } from './analytics/analytics.service';
import { LocaleSwitcherComponent } from './locale-switcher/locale-switcher.component';
import { ThemeToggleComponent } from './theme/theme-toggle.component';
import { ThemeService } from './theme/theme.service';
import { getStoredLanguage } from './i18n/locales';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TranslateModule,
    LocaleSwitcherComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  private readonly analytics = inject(AnalyticsService);

  ngOnInit(): void {
    const language = getStoredLanguage();

    this.translate.onLangChange.subscribe(({ lang }) => {
      this.portfolioApi.configureLocale(lang);
      document.documentElement.lang = lang;
    });

    this.translate.use(language);
    this.analytics.trackPageView(language);
  }
}
