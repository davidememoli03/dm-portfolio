import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { PortfolioProject } from '../../models/portfolio.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'dm-project-detail',
  imports: [RouterLink, TranslateModule, IconComponent],
  templateUrl: './project-detail.component.html',
  styles: [`:host { display: block; width: 100%; }`],
})
export class ProjectDetailComponent {
  readonly project = input.required<PortfolioProject>();
}
