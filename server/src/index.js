import cors from 'cors';
import express from 'express';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioData = JSON.parse(
  readFileSync(join(__dirname, '../data/portfolio.json'), 'utf-8'),
);

const SUPPORTED_LOCALES = ['it', 'en'];
const DEFAULT_LOCALE = 'it';

function resolveLocale(req) {
  const queryLang = req.query.lang?.split('-')[0];
  if (queryLang && SUPPORTED_LOCALES.includes(queryLang)) {
    return queryLang;
  }

  const headerLang = req.headers['accept-language']
    ?.split(',')[0]
    ?.split('-')[0];

  if (headerLang && SUPPORTED_LOCALES.includes(headerLang)) {
    return headerLang;
  }

  return DEFAULT_LOCALE;
}

function pickLocalized(value, locale) {
  if (value && typeof value === 'object' && locale in value) {
    return value[locale];
  }

  if (value && typeof value === 'object' && DEFAULT_LOCALE in value) {
    return value[DEFAULT_LOCALE];
  }

  return value;
}

function localizeProfile(profile, locale) {
  return {
    name: profile.name,
    email: profile.email,
    github: profile.github,
    linkedin: profile.linkedin,
    title: pickLocalized(profile.title, locale),
    bio: pickLocalized(profile.bio, locale),
    location: pickLocalized(profile.location, locale),
  };
}

function localizeProject(project, locale) {
  return {
    id: project.id,
    title: pickLocalized(project.title, locale),
    description: pickLocalized(project.description, locale),
    technologies: project.technologies,
    url: project.url,
    repoUrl: project.repoUrl,
  };
}

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dm-portfolio-api' });
});

app.get('/api/profile', (req, res) => {
  const locale = resolveLocale(req);
  res.json(localizeProfile(portfolioData.profile, locale));
});

app.get('/api/projects', (req, res) => {
  const locale = resolveLocale(req);
  res.json(portfolioData.projects.map((project) => localizeProject(project, locale)));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});
