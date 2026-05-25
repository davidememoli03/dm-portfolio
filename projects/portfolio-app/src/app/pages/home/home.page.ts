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

@Component({
  selector: 'app-home-page',
  imports: [
    TranslateModule,
    HeroSectionComponent,
    ProjectsGridComponent,
    ContactSectionComponent,
  ],
  template: `
    @if (loading()) {
      <div class="glass mx-auto my-24 max-w-md rounded-2xl p-8 text-center" role="status" aria-live="polite">
        <div class="mx-auto mb-4 h-2 w-24 overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
          <span class="block h-full w-1/3 animate-pulse rounded-full bg-[var(--color-accent)]"></span>
        </div>
        <p class="text-[var(--color-text-muted)]">{{ 'app.loading' | translate }}</p>
      </div>
    } @else if (error()) {
      <div class="glass mx-auto my-24 max-w-md rounded-2xl p-8 text-center" role="alert">
        <p class="font-medium text-[var(--color-text)]">{{ error() }}</p>
      </div>
    } @else if (profile()) {
      <dm-hero-section [profile]="profile()!" />
      <dm-projects-grid [projects]="projects()" />
      <dm-contact-section [profile]="profile()!" />
    }
  `,
})
export class HomePage implements OnInit {
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly translate = inject(TranslateService);

  readonly profile = signal<PortfolioProfile | null>(null);
  readonly projects = signal<PortfolioProject[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => this.loadPortfolio());
    this.loadPortfolio();
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
