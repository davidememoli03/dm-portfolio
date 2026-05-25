import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

const SESSION_KEY = 'dm-portfolio.session';
const TRACKED_KEY = 'dm-portfolio.analytics.tracked';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  trackPageView(locale: string): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return;
    }

    if (sessionStorage.getItem(TRACKED_KEY)) {
      return;
    }

    const sessionId = this.getOrCreateSessionId();
    const payload = {
      sessionId,
      path: window.location.pathname || '/',
      locale: locale.split('-')[0] === 'en' ? 'en' : 'it',
      referrer: document.referrer || undefined,
    };

    this.http.post('/api/analytics/pageview', payload).subscribe({
      next: () => sessionStorage.setItem(TRACKED_KEY, '1'),
      error: () => {
        /* analytics must never block the portfolio */
      },
    });
  }

  private getOrCreateSessionId(): string {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      return existing;
    }

    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
    return sessionId;
  }
}
