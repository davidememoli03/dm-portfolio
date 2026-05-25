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
}
