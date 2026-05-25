import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './theme/theme.service';

@Component({
  selector: 'admin-root',
  imports: [RouterOutlet],
  template: `
    <div class="admin-shell">
      <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <span class="aurora aurora-1 absolute -top-32 -left-24 h-[28rem] w-[28rem] sm:h-[36rem] sm:w-[36rem]"></span>
        <span class="aurora aurora-2 absolute top-1/3 -right-32 h-[24rem] w-[24rem] sm:h-[32rem] sm:w-[32rem]"></span>
        <span class="aurora aurora-3 absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] sm:h-[34rem] sm:w-[34rem]"></span>
      </div>
      <router-outlet />
    </div>
  `,
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
}
