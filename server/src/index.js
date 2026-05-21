import cors from 'cors';
import express from 'express';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioData = JSON.parse(
  readFileSync(join(__dirname, '../data/portfolio.json'), 'utf-8'),
);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dm-portfolio-api' });
});

app.get('/api/profile', (_req, res) => {
  res.json(portfolioData.profile);
});

app.get('/api/projects', (_req, res) => {
  res.json(portfolioData.projects);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});
