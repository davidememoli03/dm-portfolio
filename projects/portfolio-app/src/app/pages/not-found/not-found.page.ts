import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SeoService } from '../../seo/seo.service';
import { SeoLocale } from '../../seo/seo.config';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslateModule],
  styles: [`:host { display: block; width: 100%; }`],
  template: `
    <div class="content-wrap w-full">
      <section
        class="glass mx-auto my-24 flex min-h-[50vh] max-w-lg flex-col items-center justify-center rounded-2xl px-8 py-12 text-center"
        aria-labelledby="not-found-title"
      >
        <p
          class="text-7xl font-bold tracking-tight text-[var(--color-accent)] sm:text-8xl"
          aria-hidden="true"
        >
          {{ 'notFound.code' | translate }}
        </p>
        <h1 id="not-found-title" class="mt-4 text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
          {{ 'notFound.title' | translate }}
        </h1>
        <p class="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
          {{ 'notFound.description' | translate }}
        </p>
        <a
          routerLink="/"
          class="mt-8 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-xs font-semibold text-[var(--color-accent-fg)] transition-transform hover:-translate-y-px"
        >
          {{ 'notFound.backHome' | translate }}
        </a>
      </section>
    </div>
  `,
})
export class NotFoundPage implements OnInit {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    const path = this.currentPath();
    this.seo.applyNotFound(this.currentLocale(), path);

    this.translate.onLangChange.subscribe(({ lang }) => {
      this.seo.applyNotFound(this.toSeoLocale(lang), this.currentPath());
    });
  }

  private currentPath(): string {
    return this.router.url.split('?')[0].split('#')[0] || '/';
  }

  private currentLocale(): SeoLocale {
    return this.toSeoLocale(
      this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'it',
    );
  }

  private toSeoLocale(lang: string | null | undefined): SeoLocale {
    return lang?.split('-')[0] === 'en' ? 'en' : 'it';
  }
}
