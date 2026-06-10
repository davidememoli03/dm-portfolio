export const SEO_DOMAIN = 'https://dev-memoli.it';

export const SEO_DEFAULTS = {
  siteName: 'Davide Memoli — Portfolio',
  author: 'Davide Memoli',
  twitter: '',
  defaultImage: '/media/foto/davide-memoli.jpg',
  defaultImageAlt: {
    it: 'Foto di Davide Memoli, Sviluppatore Full Stack',
    en: 'Photo of Davide Memoli, Full Stack Developer',
  },
  themeColorLight: '#f5f3ff',
  themeColorDark: '#0b0d18',
} as const;

export type SeoLocale = 'it' | 'en';

export interface SeoLocalizedString {
  it: string;
  en: string;
}

export interface SeoPageContent {
  title: SeoLocalizedString;
  description: SeoLocalizedString;
  keywords?: SeoLocalizedString;
  image?: string;
  imageAlt?: SeoLocalizedString;
}

export const HOME_SEO: SeoPageContent = {
  title: {
    it: 'Davide Memoli · Sviluppatore Full Stack Angular, Laravel, Django',
    en: 'Davide Memoli · Full Stack Developer · Angular, Laravel, Django',
  },
  description: {
    it: 'Portfolio di Davide Memoli, sviluppatore full stack: applicazioni web moderne con Angular, Laravel, Django, Node.js, Docker e PostgreSQL. Progetti open source, esperienze e contatti.',
    en: 'Portfolio of Davide Memoli, full stack developer: modern web applications with Angular, Laravel, Django, Node.js, Docker and PostgreSQL. Open source projects, experience and contact.',
  },
  keywords: {
    it: 'Davide Memoli, sviluppatore full stack, Angular, Laravel, Django, Node.js, TypeScript, Docker, PostgreSQL, portfolio sviluppatore Italia, open source, web developer',
    en: 'Davide Memoli, full stack developer, Angular, Laravel, Django, Node.js, TypeScript, Docker, PostgreSQL, web developer portfolio Italy, open source',
  },
};

export const PROJECT_NOT_FOUND_SEO: SeoPageContent = {
  title: {
    it: 'Progetto non trovato · Davide Memoli',
    en: 'Project not found · Davide Memoli',
  },
  description: {
    it: 'Il progetto richiesto non è disponibile. Torna alla home per esplorare tutti i progetti.',
    en: 'The requested project is not available. Return to the home page to explore all projects.',
  },
};

export const PROJECTS_SEO: Record<string, SeoPageContent> = {
  'arcade-ui': {
    title: {
      it: 'Arcade UI · Kit UI arcade anni \'80 in CSS e JS · Davide Memoli',
      en: 'Arcade UI · 80s arcade UI kit in CSS and JS · Davide Memoli',
    },
    description: {
      it: 'Arcade UI: 80+ componenti CSS arcade con neon, CRT, audio synth via Web Audio API. Vanilla, React e Angular, senza dipendenze runtime.',
      en: 'Arcade UI: 80+ arcade CSS components with neon, CRT, synth audio via the Web Audio API. Vanilla, React and Angular, zero runtime dependencies.',
    },
    keywords: {
      it: 'Arcade UI, kit UI arcade, CSS arcade, neon CSS, CRT effect, Web Audio API, componenti Angular, componenti React, Davide Memoli',
      en: 'Arcade UI, arcade UI kit, CSS arcade, neon CSS, CRT effect, Web Audio API, Angular components, React components, Davide Memoli',
    },
  },
  'dm-portfolio': {
    title: {
      it: 'DM Portfolio · Monorepo Angular + Express + Postgres · Davide Memoli',
      en: 'DM Portfolio · Monorepo Angular + Express + Postgres · Davide Memoli',
    },
    description: {
      it: 'DM Portfolio: monorepo del sito di Davide Memoli con libreria Angular condivisa, app portfolio, pannello admin, API Express, PostgreSQL e Docker.',
      en: 'DM Portfolio: the monorepo behind Davide Memoli\'s site with a shared Angular library, portfolio app, admin panel, Express API, PostgreSQL and Docker.',
    },
    keywords: {
      it: 'DM Portfolio, Angular monorepo, libreria Angular, Express, PostgreSQL, Docker, Tailwind CSS, portfolio open source, Davide Memoli',
      en: 'DM Portfolio, Angular monorepo, Angular library, Express, PostgreSQL, Docker, Tailwind CSS, open source portfolio, Davide Memoli',
    },
  },
};

export const SITEMAP_PROJECT_IDS = Object.keys(PROJECTS_SEO);
