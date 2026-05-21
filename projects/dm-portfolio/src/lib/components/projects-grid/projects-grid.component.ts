import { Component, input } from '@angular/core';
import { ArcadeSoundDirective } from '@davide03memoli/arcade-ui/angular';

import { PortfolioProject } from '../../models/portfolio.models';

@Component({
  selector: 'dm-projects-grid',
  imports: [ArcadeSoundDirective],
  templateUrl: './projects-grid.component.html',
})
export class ProjectsGridComponent {
  readonly projects = input.required<PortfolioProject[]>();
}
