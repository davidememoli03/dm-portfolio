import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { PortfolioExperience } from '../../models/portfolio.models';

@Component({
  selector: 'dm-experience-section',
  imports: [TranslateModule, ScrollRevealDirective],
  templateUrl: './experience-section.component.html',
})
export class ExperienceSectionComponent {
  readonly experience = input.required<PortfolioExperience[]>();
}
