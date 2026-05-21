import { Component, input } from '@angular/core';
import { ArcadeSoundDirective } from '@davide03memoli/arcade-ui/angular';

import { PortfolioProfile } from '../../models/portfolio.models';

@Component({
  selector: 'dm-contact-section',
  imports: [ArcadeSoundDirective],
  templateUrl: './contact-section.component.html',
})
export class ContactSectionComponent {
  readonly profile = input.required<PortfolioProfile>();
}
