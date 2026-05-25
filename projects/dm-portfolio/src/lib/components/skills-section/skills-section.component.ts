import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { PortfolioSkillGroup } from '../../models/portfolio.models';

@Component({
  selector: 'dm-skills-section',
  imports: [TranslateModule, ScrollRevealDirective],
  templateUrl: './skills-section.component.html',
})
export class SkillsSectionComponent {
  readonly skills = input.required<PortfolioSkillGroup[]>();
}
