import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  arcadeUiAngularImports,
  bindGlitch,
  IconComponent,
  PortfolioProject,
  version as arcadeUiVersion,
} from 'dm-portfolio';

import { ArcadeUiStylesService } from './arcade-ui-styles.service';

type ArcadeTab = 'overview' | 'components' | 'install';

const ARCADE_COMPONENTS = [
  { name: 'Button', variant: 'primary · ghost · danger' },
  { name: 'Panel', variant: 'cyan · glass · themed borders' },
  { name: 'Card', variant: 'character select · glow' },
  { name: 'Tabs', variant: 'themed · accessible' },
  { name: 'Badge', variant: 'pulse · outline' },
  { name: 'Table', variant: 'leaderboard' },
  { name: 'Progress', variant: 'themed bars' },
  { name: 'Input', variant: 'label · toggle' },
];

@Component({
  selector: 'app-arcade-ui-project',
  imports: [RouterLink, TranslateModule, IconComponent, ...arcadeUiAngularImports],
  providers: [ArcadeUiStylesService],
  templateUrl: './arcade-ui-project.component.html',
  styleUrl: './arcade-ui-project.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ArcadeUiProjectComponent implements AfterViewInit, OnDestroy {
  readonly project = input.required<PortfolioProject>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('arcadeHost');
  private readonly arcadeStyles = inject(ArcadeUiStylesService);

  protected readonly theme = 'arc-theme-ice-blue';
  protected readonly version = arcadeUiVersion;
  protected readonly components = ARCADE_COMPONENTS;
  protected readonly activeTab = signal<ArcadeTab>('overview');

  setTab(tab: ArcadeTab): void {
    this.activeTab.set(tab);
  }

  isTab(tab: ArcadeTab): boolean {
    return this.activeTab() === tab;
  }

  async ngAfterViewInit(): Promise<void> {
    await this.arcadeStyles.load();

    const title = this.host().nativeElement.querySelector('.arcade-title');
    if (title) {
      bindGlitch(title);
    }
  }

  ngOnDestroy(): void {
    this.arcadeStyles.unload();
  }
}
