import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import {
  ContactSectionComponent,
  HeroSectionComponent,
  PortfolioApiService,
  PortfolioProfile,
  PortfolioProject,
  ProjectsGridComponent,
} from 'dm-portfolio';

import { LocaleSwitcherComponent } from './locale-switcher/locale-switcher.component';
import { ThemeToggleComponent } from './theme/theme-toggle.component';
import { ThemeService } from './theme/theme.service';
import { getStoredLanguage } from './i18n/locales';

@Component({
  selector: 'app-root',
  imports: [
    TranslateModule,
    LocaleSwitcherComponent,
    ThemeToggleComponent,
    HeroSectionComponent,
    ProjectsGridComponent,
    ContactSectionComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);

  readonly profile = signal<PortfolioProfile | null>(null);
  readonly projects = signal<PortfolioProject[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const language = getStoredLanguage();

    this.translate.onLangChange.subscribe(({ lang }) => {
      this.portfolioApi.configureLocale(lang);
      document.documentElement.lang = lang;
      this.loadPortfolio();
    });

    this.translate.use(language);
  }

  private loadPortfolio(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      profile: this.portfolioApi.getProfile(),
      projects: this.portfolioApi.getProjects(),
    }).subscribe({
      next: ({ profile, projects }) => {
        this.profile.set(profile);
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('app.error.load'));
        this.loading.set(false);
      },
    });
  }
}
