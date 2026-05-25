import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pickLocalized, resolveLocale } from '../lib/locale.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioDataPath = join(__dirname, '../../data/portfolio.json');

function loadPortfolioData() {
  return JSON.parse(readFileSync(portfolioDataPath, 'utf-8'));
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
    npmUrl: project.npmUrl,
  };
}

function localizeProjectDetail(project, locale) {
  const base = localizeProject(project, locale);
  if (!project.detail) {
    return base;
  }

  return {
    ...base,
    detail: {
      tagline: pickLocalized(project.detail.tagline, locale),
      highlights: (project.detail.highlights ?? []).map((item) => ({
        title: pickLocalized(item.title, locale),
        body: pickLocalized(item.body, locale),
      })),
      sections: (project.detail.sections ?? []).map((item) => ({
        title: pickLocalized(item.title, locale),
        body: pickLocalized(item.body, locale),
      })),
    },
  };
}

export const portfolioRouter = Router();

portfolioRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dm-portfolio-api' });
});

portfolioRouter.get('/profile', (req, res) => {
  const locale = resolveLocale(req);
  const { profile } = loadPortfolioData();
  res.json(localizeProfile(profile, locale));
});

portfolioRouter.get('/projects', (req, res) => {
  const locale = resolveLocale(req);
  const { projects } = loadPortfolioData();
  res.json(projects.map((project) => localizeProject(project, locale)));
});

portfolioRouter.get('/projects/:id', (req, res) => {
  const locale = resolveLocale(req);
  const { projects } = loadPortfolioData();
  const project = projects.find((item) => item.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  res.json(localizeProjectDetail(project, locale));
});
