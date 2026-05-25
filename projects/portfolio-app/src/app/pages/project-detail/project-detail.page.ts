import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PortfolioApiService, PortfolioProject, ProjectDetailComponent } from 'dm-portfolio';

import { ArcadeUiProjectComponent } from './arcade-ui-project.component';

@Component({
  selector: 'app-project-detail-page',
  imports: [RouterLink, TranslateModule, ProjectDetailComponent, ArcadeUiProjectComponent],
  styles: [`:host { display: block; width: 100%; }`],
  template: `
    <div class="content-wrap w-full">
    @if (loading()) {
      <div class="glass mx-auto my-24 max-w-md rounded-2xl p-8 text-center" role="status" aria-live="polite">
        <div class="mx-auto mb-4 h-2 w-24 overflow-hidden rounded-full bg-[var(--color-accent-soft)]">
          <span class="block h-full w-1/3 animate-pulse rounded-full bg-[var(--color-accent)]"></span>
        </div>
        <p class="text-[var(--color-text-muted)]">{{ 'app.loading' | translate }}</p>
      </div>
    } @else if (notFound()) {
      <div class="glass mx-auto my-24 max-w-md rounded-2xl p-8 text-center" role="alert">
        <p class="font-medium text-[var(--color-text)]">{{ 'projectDetail.notFound' | translate }}</p>
        <a
          routerLink="/"
          fragment="projects"
          class="mt-4 inline-flex rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-[var(--color-accent-fg)]"
        >
          {{ 'projectDetail.back' | translate }}
        </a>
      </div>
    } @else if (project(); as current) {
      @if (current.id === 'arcade-ui') {
        <app-arcade-ui-project [project]="current" />
      } @else {
        <dm-project-detail [project]="current" />
      }
    }
    </div>
  `,
})
export class ProjectDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly project = signal<PortfolioProject | null>(null);

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.fetchProject(id);
      }
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fetchProject(id);
      } else {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }

  private fetchProject(id: string): void {
    this.loading.set(true);
    this.notFound.set(false);

    this.portfolioApi.getProject(id).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loading.set(false);
      },
      error: () => {
        this.project.set(null);
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }
}
