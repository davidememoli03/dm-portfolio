import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ArcadeSoundDirective } from '@davide03memoli/arcade-ui/angular';

import { PortfolioProfile } from '../../models/portfolio.models';

@Component({
  selector: 'dm-contact-section',
  imports: [TranslateModule, ArcadeSoundDirective],
  templateUrl: './contact-section.component.html',
})
export class ContactSectionComponent {
  readonly profile = input.required<PortfolioProfile>();
}
