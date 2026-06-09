import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';

const SCROLL_THRESHOLD_PX = 240;

@Component({
  selector: 'app-back-home-button',
  imports: [RouterLink, TranslateModule],
  template: `
    @if (visible()) {
      <div class="glass inline-flex items-center rounded-full p-1">
        <a
          routerLink="/"
          class="back-home-fab"
          [attr.aria-label]="'nav.backHome' | translate"
          (click)="handleClick($event)"
        >
          <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
        </a>
      </div>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        left: 50%;
        bottom: 1.5rem;
        z-index: 50;
        pointer-events: none;
        transform: translateX(-50%);
      }

      @media (min-width: 640px) {
        :host {
          bottom: 2rem;
        }
      }

      :host > .glass {
        pointer-events: auto;
      }

      .back-home-fab {
        display: inline-flex;
        height: 2.25rem;
        width: 2.25rem;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        color: var(--color-text-muted);
        text-decoration: none;
        transition:
          transform 180ms ease,
          color 180ms ease,
          background-color 180ms ease;
      }

      .back-home-fab:hover {
        color: var(--color-text);
        background: var(--color-accent-soft);
        transform: translateY(-1px);
      }

      .back-home-fab:focus-visible {
        outline: none;
        box-shadow: var(--ring-focus);
      }
    `,
  ],
})
export class BackHomeButtonComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly visible = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => this.updateVisibility());

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updateVisibility());

    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', this.onScroll));
  }

  private readonly onScroll = (): void => {
    this.updateVisibility();
  };

  handleClick(event: MouseEvent): void {
    if (!this.isHomeRoute()) {
      return;
    }

    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }

  private updateVisibility(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.visible.set(window.scrollY > SCROLL_THRESHOLD_PX || !this.isHomeRoute());
  }

  private isHomeRoute(): boolean {
    const url = this.router.url.split('?')[0].split('#')[0];
    return url === '/' || url === '';
  }
}
