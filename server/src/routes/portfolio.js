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

function localizeExperienceParagraphs(description, locale) {
  const localized = pickLocalized(description, locale);

  if (Array.isArray(localized)) {
    return localized;
  }

  return localized ? [localized] : [];
}

function localizeExperience(entry, locale) {
  return {
    id: entry.id,
    company: pickLocalized(entry.company, locale),
    role: pickLocalized(entry.role, locale),
    period: pickLocalized(entry.period, locale),
    description: localizeExperienceParagraphs(entry.description, locale),
    url: entry.url,
  };
}

function localizeSkillItem(item, locale) {
  return typeof item === 'string' ? item : pickLocalized(item, locale);
}

function localizeSkillGroup(group, locale) {
  return {
    id: group.id,
    title: pickLocalized(group.title, locale),
    items: (group.items ?? []).map((item) => localizeSkillItem(item, locale)),
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

portfolioRouter.get('/experience', (req, res) => {
  const locale = resolveLocale(req);
  const { experience = [] } = loadPortfolioData();
  res.json(experience.map((entry) => localizeExperience(entry, locale)));
});

portfolioRouter.get('/skills', (req, res) => {
  const locale = resolveLocale(req);
  const { skills = [] } = loadPortfolioData();
  res.json(skills.map((group) => localizeSkillGroup(group, locale)));
});

// Aggregated payload for the home page: one request instead of four serial
// round trips, which removes a chunk of the LCP critical path.
portfolioRouter.get('/portfolio', (req, res) => {
  const locale = resolveLocale(req);
  const { profile, projects = [], experience = [], skills = [] } = loadPortfolioData();

  res.json({
    profile: localizeProfile(profile, locale),
    experience: experience.map((entry) => localizeExperience(entry, locale)),
    skills: skills.map((group) => localizeSkillGroup(group, locale)),
    projects: projects.map((project) => localizeProject(project, locale)),
  });
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
