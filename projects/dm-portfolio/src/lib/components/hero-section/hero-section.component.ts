import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PortfolioProfile } from '../../models/portfolio.models';

@Component({
  selector: 'dm-hero-section',
  imports: [TranslateModule],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {
  readonly profile = input.required<PortfolioProfile>();
}
