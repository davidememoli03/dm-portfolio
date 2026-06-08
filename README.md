# DM Portfolio

Monorepo per un portfolio personale con:

- **Angular 21** (`projects/portfolio-app`) — applicazione frontend
- **Angular 21** (`projects/admin-app`) — pannello admin per gestione messaggi
- **Libreria `dm-portfolio`** (`projects/dm-portfolio`) — componenti riutilizzabili
- **Tailwind CSS 4** — styling con design tokens condivisi (`projects/shared-styles/tokens.css`)
- **Node.js 22+ + Express 5** (`server/`) — API REST con auth admin + Postgres
- **PostgreSQL 17** — persistenza messaggi di contatto
- **Docker** — ambiente dev e produzione

## Struttura

```text
dm-portfolio/
├── projects/
│   ├── dm-portfolio/      # libreria Angular
│   ├── portfolio-app/     # app portfolio (porta 4200/8080)
│   ├── admin-app/         # pannello admin (porta 4201/8081)
│   └── shared-styles/     # tokens.css condiviso
├── server/                # backend Express + Postgres
├── db/                    # schema SQL Postgres
├── docker/                # Dockerfile e nginx
├── docker-compose.yml     # produzione
├── docker-compose.dev.yml # sviluppo con hot reload
└── .env.example           # variabili d'ambiente di riferimento
```

## Setup iniziale (una tantum)

1. Copia `.env.example` in `.env` nella root del progetto.
2. Genera l'hash bcrypt della tua password admin:
   ```bash
   cd server && npm install && npm run hash-password -- 'la-tua-password'
   ```
   Copia l'output nella variabile `ADMIN_PASSWORD_HASH` del `.env`.
3. Imposta `JWT_SECRET` con una stringa lunga e casuale.

## Avvio rapido (Docker)

### Sviluppo

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Portfolio: http://localhost:4200
- Admin: http://localhost:4201
- Backend API: http://localhost:3000/api/health
- Postgres: localhost:5432

### Produzione

```bash
docker compose up --build
```

- Portfolio: http://localhost:8080
- Admin: http://localhost:8081

## Pubblicazione su GitHub Pages

Il workflow [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) pubblica **solo il frontend** (`portfolio-app`) su push su `main`.

### Setup (una tantum su GitHub)

1. **Settings → Pages → Build and deployment**
   - Source: **GitHub Actions**
2. Push su `main` oppure avvia manualmente il workflow **Deploy portfolio to GitHub Pages** (tab Actions).

### URL

- Progetto: `https://davidememoli03.github.io/dm-portfolio/`
- Build con `baseHref` `/dm-portfolio/` (config `github-pages` in `angular.json`)

### Build locale (anteprima)

```bash
npm run build:pages
npx serve dist/portfolio-app/browser -l 5000
```

Apri http://localhost:5000/dm-portfolio/

### Note

- GitHub Pages serve **solo file statici**: le chiamate a `/api` non funzionano senza un backend esterno.
- Per SPA routing è incluso `404.html` (copia di `index.html`) nel workflow.
- Se rinomini il repository, aggiorna `baseHref` / `deployUrl` in `angular.json` → `portfolio-app` → `configurations.github-pages`.

## Avvio locale (senza Docker)

```bash
# root — frontend
npm install
npm run server:install
npm run build:lib

# terminale 1 — backend
npm run server:dev

# terminale 2 — frontend
npm start
```

## API

### Pubblici

| Endpoint              | Descrizione                                      |
|-----------------------|--------------------------------------------------|
| `GET /api/health`     | Health check                                     |
| `GET /api/profile`    | Profilo portfolio (i18n via `?lang=`)            |
| `GET /api/projects`   | Lista progetti (i18n via `?lang=`)               |
| `POST /api/contact`   | Invio messaggio contatto (rate limit + honeypot) |

### Admin (richiede cookie JWT)

| Endpoint                              | Descrizione                                          |
|---------------------------------------|------------------------------------------------------|
| `POST /api/admin/auth/login`          | Login admin (rate limit 10/15min)                    |
| `POST /api/admin/auth/logout`         | Logout (clear cookie)                                |
| `GET /api/admin/auth/me`              | Info admin loggato                                   |
| `GET /api/admin/messages`             | Lista messaggi (filtro status/search, paginazione)   |
| `GET /api/admin/messages/:id`         | Dettaglio (auto mark-read se status era `new`)       |
| `PATCH /api/admin/messages/:id`       | Aggiorna status (`new`/`read`/`archived`/`spam`)     |
| `DELETE /api/admin/messages/:id`      | Cancella definitivamente                             |

I dati statici (profilo/progetti) sono in `server/data/portfolio.json`.
I messaggi di contatto sono in Postgres (`messages` table).

## i18n

Traduzioni runtime con **`@ngx-translate/core`** (`TranslateModule` + pipe `translate`).

File JSON in `projects/portfolio-app/public/i18n/`:

- `it.json` — italiano (fallback)
- `en.json` — inglese

Configurazione root in `app.config.ts` con `provideTranslateService` e `provideTranslateHttpLoader`.

Nei componenti:

```typescript
import { TranslateModule } from '@ngx-translate/core';
// oppure dalla libreria:
import { TranslateModule } from 'dm-portfolio';
```

```html
<h2>{{ 'projects.title' | translate }}</h2>
```

Lo switch IT/EN cambia lingua a runtime (preferenza salvata in `localStorage`). Il backend risponde con `?lang=it|en` per profilo e progetti.

## Design system

Stile **glassmorphism** con design tokens via CSS variables in `projects/shared-styles/tokens.css`:

- Palette light/dark con fallback `prefers-color-scheme`
- Override manuale via `[data-theme="light"|"dark"]` (toggle UI nel header)
- Utility class: `.glass`, `.glass-strong`, `.aurora`, `.text-display`, `.text-headline`, `.text-eyebrow`
- Animazioni rispettano `prefers-reduced-motion`
- Font Inter via Google Fonts

Il file viene importato sia da `portfolio-app/src/styles.css` sia da `admin-app/src/styles.css`.

## Libreria dm-portfolio

Componenti esportati:

- `HeroSectionComponent`
- `ProjectsGridComponent`
- `ContactSectionComponent`
- `PortfolioApiService`

```typescript
import {
  HeroSectionComponent,
  ProjectsGridComponent,
  ContactSectionComponent,
  PortfolioApiService,
} from 'dm-portfolio';
```

Build libreria:

```bash
npm run build:lib
```

## Script utili

| Script | Descrizione |
|--------|-------------|
| `npm start` | Avvia portfolio-app in dev (porta 4200) |
| `npm run start:admin` | Avvia admin-app in dev (porta 4201) |
| `npm run build` | Build libreria + entrambe le app |
| `npm run build:lib` | Solo libreria |
| `npm run build:app` | Solo portfolio-app |
| `npm run build:admin` | Solo admin-app |
| `npm run server:dev` | Backend con `--watch` |
| `cd server && npm run hash-password -- 'pwd'` | Genera bcrypt hash per `ADMIN_PASSWORD_HASH` |
| `npm run docker:dev` | Stack Docker dev (db + backend + portfolio + admin) |
| `npm run docker:prod` | Stack Docker produzione |

## Licenza

MIT — vedi [LICENSE](LICENSE).
