# DM Portfolio

Monorepo per un portfolio personale con:

- **Angular 21** (`projects/portfolio-app`) — applicazione frontend
- **Libreria `dm-portfolio`** (`projects/dm-portfolio`) — componenti riutilizzabili
- **Tailwind CSS 4** — styling
- **Node.js + Express** (`server/`) — API REST minimale
- **Docker** — ambiente dev e produzione

## Struttura

```text
dm-portfolio/
├── projects/
│   ├── dm-portfolio/      # libreria Angular
│   └── portfolio-app/     # app portfolio
├── server/                # backend Express
├── docker/                # Dockerfile e nginx
├── docker-compose.yml     # produzione
└── docker-compose.dev.yml # sviluppo con hot reload
```

## Avvio rapido (Docker)

### Sviluppo

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api/health

### Produzione

```bash
docker compose up --build
```

- App completa (nginx + proxy API): http://localhost:8080

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

| Endpoint          | Descrizione              |
|-------------------|--------------------------|
| `GET /api/health` | Health check             |
| `GET /api/profile`| Profilo portfolio        |
| `GET /api/projects` | Lista progetti         |

I dati sono in `server/data/portfolio.json`.

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
| `npm start` | Avvia Angular in dev |
| `npm run build` | Build libreria + app |
| `npm run server:dev` | Backend con `--watch` |
| `npm run docker:dev` | Stack Docker dev |
| `npm run docker:prod` | Stack Docker produzione |

## Licenza

MIT — vedi [LICENSE](LICENSE).
