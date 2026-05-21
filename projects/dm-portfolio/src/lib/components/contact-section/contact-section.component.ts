import { Component, input } from '@angular/core';

import { PortfolioProfile } from '../../models/portfolio.models';

@Component({
  selector: 'dm-contact-section',
  imports: [],
  templateUrl: './contact-section.component.html',
})
export class ContactSectionComponent {
  readonly profile = input.required<PortfolioProfile>();
}
