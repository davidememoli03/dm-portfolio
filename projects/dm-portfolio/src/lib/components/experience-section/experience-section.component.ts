import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { PortfolioExperience } from '../../models/portfolio.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'dm-experience-section',
  imports: [TranslateModule, ScrollRevealDirective, IconComponent],
  templateUrl: './experience-section.component.html',
})
export class ExperienceSectionComponent {
  readonly experience = input.required<PortfolioExperience[]>();
}
