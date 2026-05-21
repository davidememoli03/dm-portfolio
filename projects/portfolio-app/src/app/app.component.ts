import { Component, inject, OnInit, signal } from '@angular/core';
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
  selector: 'app-root',
  imports: [
    HeroSectionComponent,
    ProjectsGridComponent,
    ContactSectionComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly portfolioApi = inject(PortfolioApiService);

  readonly profile = signal<PortfolioProfile | null>(null);
  readonly projects = signal<PortfolioProject[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
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
        this.error.set('Impossibile caricare i dati del portfolio.');
        this.loading.set(false);
      },
    });
  }
}
