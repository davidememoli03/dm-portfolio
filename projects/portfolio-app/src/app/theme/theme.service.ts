import { Injectable, computed, signal } from '@angular/core';

import {
  ResolvedTheme,
  ThemePreference,
  applyTheme,
  getStoredTheme,
  resolveTheme,
  storeTheme,
} from './theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly preferenceSignal = signal<ThemePreference>(getStoredTheme());
  private readonly systemSchemeSignal = signal<ResolvedTheme>(resolveTheme('system'));

  readonly preference = this.preferenceSignal.asReadonly();
  readonly resolved = computed<ResolvedTheme>(() => {
    const pref = this.preferenceSignal();
    return pref === 'system' ? this.systemSchemeSignal() : pref;
  });

  constructor() {
    applyTheme(this.preferenceSignal());
    this.listenForSystemChanges();
  }

  setPreference(theme: ThemePreference): void {
    this.preferenceSignal.set(theme);
    storeTheme(theme);
    applyTheme(theme);
  }

  private listenForSystemChanges(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      this.systemSchemeSignal.set(event.matches ? 'dark' : 'light');
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handler);
    } else if (typeof media.addListener === 'function') {
      media.addListener(handler);
    }
  }
}
