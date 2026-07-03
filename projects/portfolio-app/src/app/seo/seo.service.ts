import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import {
  HOME_SEO,
  NOT_FOUND_SEO,
  PROJECTS_SEO,
  PROJECT_NOT_FOUND_SEO,
  SEO_DEFAULTS,
  SEO_DOMAIN,
  SeoLocale,
  SeoPageContent,
} from './seo.config';

const JSON_LD_PAGE_ID = 'seo-jsonld-page';
const JSON_LD_BREADCRUMB_ID = 'seo-jsonld-breadcrumb';

interface SeoSnapshot {
  title: string;
  description: string;
  keywords?: string;
  image: string;
  imageAlt: string;
  url: string;
  locale: SeoLocale;
  type: 'website' | 'article' | 'profile';
  noindex: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  applyHome(locale: SeoLocale): void {
    const snapshot = this.buildSnapshot(HOME_SEO, locale, '/', 'website', false);
    this.apply(snapshot);
    this.setJsonLd(JSON_LD_PAGE_ID, this.buildWebsiteJsonLd(snapshot));
    this.removeJsonLd(JSON_LD_BREADCRUMB_ID);
  }

  applyProject(projectId: string, locale: SeoLocale, dynamic?: Partial<SeoPageContent>): void {
    const base = PROJECTS_SEO[projectId] ?? this.buildFallbackProjectContent(projectId);
    const merged = this.mergeContent(base, dynamic);
    const snapshot = this.buildSnapshot(merged, locale, `/projects/${projectId}`, 'article', false);
    this.apply(snapshot);
    this.setJsonLd(JSON_LD_PAGE_ID, this.buildProjectJsonLd(snapshot, projectId));
    this.setJsonLd(JSON_LD_BREADCRUMB_ID, this.buildBreadcrumbJsonLd(snapshot, locale));
  }

  applyNotFound(locale: SeoLocale, path = '/'): void {
    const snapshot = this.buildSnapshot(NOT_FOUND_SEO, locale, path, 'website', true);
    this.apply(snapshot);
    this.removeJsonLd(JSON_LD_PAGE_ID);
    this.removeJsonLd(JSON_LD_BREADCRUMB_ID);
  }

  applyProjectNotFound(locale: SeoLocale): void {
    const snapshot = this.buildSnapshot(PROJECT_NOT_FOUND_SEO, locale, '/', 'website', true);
    this.apply(snapshot);
    this.removeJsonLd(JSON_LD_PAGE_ID);
    this.removeJsonLd(JSON_LD_BREADCRUMB_ID);
  }

  private apply(snapshot: SeoSnapshot): void {
    this.title.setTitle(snapshot.title);
    this.document.documentElement.lang = snapshot.locale;

    this.setMeta('name', 'description', snapshot.description);
    if (snapshot.keywords) {
      this.setMeta('name', 'keywords', snapshot.keywords);
    } else {
      this.meta.removeTag('name="keywords"');
    }
    this.setMeta('name', 'author', SEO_DEFAULTS.author);
    this.setMeta(
      'name',
      'robots',
      snapshot.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );

    this.setMeta('property', 'og:locale', snapshot.locale === 'it' ? 'it_IT' : 'en_US');
    this.setMeta(
      'property',
      'og:locale:alternate',
      snapshot.locale === 'it' ? 'en_US' : 'it_IT',
    );
    this.setMeta('property', 'og:type', snapshot.type);
    this.setMeta('property', 'og:site_name', SEO_DEFAULTS.siteName);
    this.setMeta('property', 'og:title', snapshot.title);
    this.setMeta('property', 'og:description', snapshot.description);
    this.setMeta('property', 'og:url', snapshot.url);
    this.setMeta('property', 'og:image', snapshot.image);
    this.setMeta('property', 'og:image:alt', snapshot.imageAlt);
    this.setMeta('property', 'og:image:width', '1200');
    this.setMeta('property', 'og:image:height', '630');

    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', snapshot.title);
    this.setMeta('name', 'twitter:description', snapshot.description);
    this.setMeta('name', 'twitter:image', snapshot.image);
    this.setMeta('name', 'twitter:image:alt', snapshot.imageAlt);

    this.setCanonical(snapshot.url);
    this.setHreflang(snapshot.url);
  }

  private buildSnapshot(
    content: SeoPageContent,
    locale: SeoLocale,
    path: string,
    type: SeoSnapshot['type'],
    noindex: boolean,
  ): SeoSnapshot {
    const image = this.absoluteUrl(content.image ?? SEO_DEFAULTS.defaultImage);
    const imageAlt = content.imageAlt?.[locale] ?? SEO_DEFAULTS.defaultImageAlt[locale];
    return {
      title: content.title[locale],
      description: content.description[locale],
      keywords: content.keywords?.[locale],
      image,
      imageAlt,
      url: this.absoluteUrl(path),
      locale,
      type,
      noindex,
    };
  }

  private mergeContent(base: SeoPageContent, dynamic?: Partial<SeoPageContent>): SeoPageContent {
    if (!dynamic) {
      return base;
    }

    return {
      title: { ...base.title, ...(dynamic.title ?? {}) },
      description: { ...base.description, ...(dynamic.description ?? {}) },
      keywords: dynamic.keywords ?? base.keywords,
      image: dynamic.image ?? base.image,
      imageAlt: dynamic.imageAlt ?? base.imageAlt,
    };
  }

  private buildFallbackProjectContent(projectId: string): SeoPageContent {
    const readable = projectId.replace(/[-_]/g, ' ');
    return {
      title: {
        it: `${readable} · Progetto · Davide Memoli`,
        en: `${readable} · Project · Davide Memoli`,
      },
      description: {
        it: `Dettaglio del progetto ${readable} realizzato da Davide Memoli.`,
        en: `Details of the ${readable} project built by Davide Memoli.`,
      },
    };
  }

  private setMeta(attr: 'name' | 'property', key: string, value: string): void {
    this.meta.updateTag({ [attr]: key, content: value });
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setHreflang(url: string): void {
    const head = this.document.head;
    head
      .querySelectorAll('link[rel="alternate"][data-seo-hreflang]')
      .forEach((node) => node.remove());

    const entries: Array<{ lang: string; href: string }> = [
      { lang: 'it', href: url },
      { lang: 'en', href: url },
      { lang: 'x-default', href: url },
    ];

    for (const { lang, href } of entries) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', href);
      link.setAttribute('data-seo-hreflang', 'true');
      head.appendChild(link);
    }
  }

  private setJsonLd(id: string, payload: Record<string, unknown>): void {
    const head = this.document.head;
    let script = head.querySelector<HTMLScriptElement>(`script#${id}`);
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload);
  }

  private removeJsonLd(id: string): void {
    const script = this.document.head.querySelector(`script#${id}`);
    script?.remove();
  }

  private absoluteUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SEO_DOMAIN}${cleanPath}`;
  }

  private buildWebsiteJsonLd(snapshot: SeoSnapshot): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${SEO_DOMAIN}/#website`,
          url: `${SEO_DOMAIN}/`,
          name: SEO_DEFAULTS.siteName,
          description: snapshot.description,
          inLanguage: snapshot.locale === 'it' ? 'it-IT' : 'en-US',
          publisher: { '@id': `${SEO_DOMAIN}/#person` },
        },
        {
          '@type': 'Person',
          '@id': `${SEO_DOMAIN}/#person`,
          name: SEO_DEFAULTS.author,
          url: `${SEO_DOMAIN}/`,
          email: 'mailto:davide03memoli@gmail.com',
          image: this.absoluteUrl(SEO_DEFAULTS.defaultImage),
          jobTitle: snapshot.locale === 'it' ? 'Sviluppatore Full Stack' : 'Full Stack Developer',
          sameAs: [
            'https://github.com/davidememoli03',
            'https://www.linkedin.com/in/davide-memoli/',
          ],
          knowsAbout: [
            'Angular',
            'TypeScript',
            'Laravel',
            'Django',
            'Node.js',
            'PostgreSQL',
            'Docker',
            'Tailwind CSS',
          ],
        },
        {
          '@type': 'WebPage',
          '@id': `${snapshot.url}#webpage`,
          url: snapshot.url,
          name: snapshot.title,
          description: snapshot.description,
          inLanguage: snapshot.locale === 'it' ? 'it-IT' : 'en-US',
          isPartOf: { '@id': `${SEO_DOMAIN}/#website` },
          about: { '@id': `${SEO_DOMAIN}/#person` },
          primaryImageOfPage: snapshot.image,
        },
      ],
    };
  }

  private buildProjectJsonLd(snapshot: SeoSnapshot, projectId: string): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${snapshot.url}#project`,
      url: snapshot.url,
      name: snapshot.title,
      description: snapshot.description,
      inLanguage: snapshot.locale === 'it' ? 'it-IT' : 'en-US',
      identifier: projectId,
      image: snapshot.image,
      author: {
        '@type': 'Person',
        '@id': `${SEO_DOMAIN}/#person`,
        name: SEO_DEFAULTS.author,
      },
      isPartOf: { '@id': `${SEO_DOMAIN}/#website` },
    };
  }

  private buildBreadcrumbJsonLd(snapshot: SeoSnapshot, locale: SeoLocale): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale === 'it' ? 'Home' : 'Home',
          item: `${SEO_DOMAIN}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: locale === 'it' ? 'Progetti' : 'Projects',
          item: `${SEO_DOMAIN}/#projects`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: snapshot.title,
          item: snapshot.url,
        },
      ],
    };
  }
}
