export interface PortfolioProfile {
  name: string;
  title: string;
  bio: string;
  email: string;
  github?: string;
  linkedin?: string;
  location?: string;
}

export interface PortfolioProjectHighlight {
  title: string;
  body: string;
}

export interface PortfolioProjectSection {
  title: string;
  body: string;
}

export interface PortfolioProjectDetail {
  tagline: string;
  highlights: PortfolioProjectHighlight[];
  sections: PortfolioProjectSection[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  repoUrl?: string;
  npmUrl?: string;
  detail?: PortfolioProjectDetail;
}

export interface PortfolioExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  url: string;
}
