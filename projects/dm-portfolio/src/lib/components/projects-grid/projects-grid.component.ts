import { Component, input } from '@angular/core';

import { PortfolioProject } from '../../models/portfolio.models';

@Component({
  selector: 'dm-projects-grid',
  imports: [],
  templateUrl: './projects-grid.component.html',
})
export class ProjectsGridComponent {
  readonly projects = input.required<PortfolioProject[]>();
}
