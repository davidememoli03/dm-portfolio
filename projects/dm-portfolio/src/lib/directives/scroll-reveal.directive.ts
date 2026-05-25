import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';

@Directive({
  selector: '[dmScrollReveal]',
  host: {
    class: 'scroll-reveal',
  },
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  /** When true, section is treated as visible on first paint (e.g. hero above the fold). */
  readonly immediate = input(false, { alias: 'dmScrollRevealImmediate' });

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const element = this.el.nativeElement;

    if (!isPlatformBrowser(this.platformId)) {
      element.classList.add('scroll-reveal--visible');
      return;
    }

    if (this.prefersReducedMotion()) {
      element.classList.add('scroll-reveal--visible');
      return;
    }

    if (this.immediate() || this.isPartiallyVisible(element)) {
      element.classList.add('scroll-reveal--visible');
    }

    this.observer = new IntersectionObserver(
      (entries) => this.onIntersect(entries),
      {
        threshold: [0, 0.08, 0.18],
        rootMargin: '0px 0px -6% 0px',
      },
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private onIntersect(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;

      if (entry.isIntersecting) {
        element.classList.remove('scroll-reveal--exit-up', 'scroll-reveal--exit-down');
        element.classList.add('scroll-reveal--visible');
        continue;
      }

      element.classList.remove('scroll-reveal--visible');

      const { top } = entry.boundingClientRect;
      element.classList.toggle('scroll-reveal--exit-up', top < 0);
      element.classList.toggle('scroll-reveal--exit-down', top >= 0);
    }
  }

  private isPartiallyVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
