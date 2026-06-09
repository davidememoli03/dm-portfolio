import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { PortfolioProject } from '../../models/portfolio.models';

@Component({
  selector: 'dm-projects-grid',
  imports: [RouterLink, TranslateModule, ScrollRevealDirective],
  templateUrl: './projects-grid.component.html',
})
export class ProjectsGridComponent {
  readonly projects = input.required<PortfolioProject[]>();

  /** External detail page (e.g. Arcade UI showcase) instead of /projects/:id */
  protected externalDetailUrl(project: PortfolioProject): string | null {
    if (project.id === 'arcade-ui' && project.url) {
      return project.url;
    }
    return null;
  }

  protected showDemo(project: PortfolioProject): boolean {
    return Boolean(project.url) && project.id !== 'arcade-ui';
  }
}
