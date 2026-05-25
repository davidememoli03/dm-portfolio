import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PortfolioProject } from '../../models/portfolio.models';

@Component({
  selector: 'dm-projects-grid',
  imports: [TranslateModule],
  templateUrl: './projects-grid.component.html',
})
export class ProjectsGridComponent {
  readonly projects = input.required<PortfolioProject[]>();
}
