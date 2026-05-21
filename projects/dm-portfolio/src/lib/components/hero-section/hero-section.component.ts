import { Component, input } from '@angular/core';
import { ArcadeSoundDirective } from '@davide03memoli/arcade-ui/angular';

import { PortfolioProfile } from '../../models/portfolio.models';

@Component({
  selector: 'dm-hero-section',
  imports: [ArcadeSoundDirective],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {
  readonly profile = input.required<PortfolioProfile>();
}
