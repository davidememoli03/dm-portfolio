import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

const STYLES = [
  { id: 'arcade-ui-base', href: '/vendor/arcade-ui/arcade-ui.css' },
  { id: 'arcade-ui-theme', href: '/vendor/arcade-ui/themes/ice-blue.css' },
] as const;

const THEME_CLASSES = [
  'arc-theme-phosphor',
  'arc-theme-amber-crt',
  'arc-theme-magenta-wave',
  'arc-theme-ice-blue',
] as const;

@Injectable()
export class ArcadeUiStylesService {
  private readonly doc = inject(DOCUMENT);
  private readyPromise: Promise<void> | null = null;
  private loaded = false;

  load(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = Promise.all(STYLES.map((style) => this.ensureStylesheet(style))).then(
      () => {
        this.loaded = true;
      },
    );

    return this.readyPromise;
  }

  unload(): void {
    if (!this.loaded) {
      return;
    }

    for (const style of STYLES) {
      this.doc.getElementById(style.id)?.remove();
    }

    for (const themeClass of THEME_CLASSES) {
      this.doc.documentElement.classList.remove(themeClass);
      this.doc.body.classList.remove(themeClass);
    }

    this.loaded = false;
    this.readyPromise = null;
  }

  private ensureStylesheet(style: (typeof STYLES)[number]): Promise<void> {
    const existing = this.doc.getElementById(style.id) as HTMLLinkElement | null;
    if (existing) {
      if (existing.sheet) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        existing.onload = () => resolve();
        existing.onerror = () => reject(new Error(`Failed to load ${style.href}`));
      });
    }

    return new Promise<void>((resolve, reject) => {
      const link = this.doc.createElement('link');
      link.id = style.id;
      link.rel = 'stylesheet';
      link.href = style.href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load ${style.href}`));
      this.doc.head.appendChild(link);
    });
  }
}
