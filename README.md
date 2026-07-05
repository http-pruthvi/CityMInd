# CityMind

AI-powered decision intelligence platform for smart cities — built for **Smart India Hackathon 2026**.

CityMind connects citizens, operators, and city leadership through three portals, 12 municipal domains, live maps, and a Gemini-powered AI assistant grounded in your database and policy documents.

## What it does

| Portal | Who it's for | Key features |
|--------|--------------|--------------|
| **Citizen** (`/citizen`) | Residents | AI chat, issue reporting with map pin, services directory |
| **Operator** (`/operator`) | City staff | Live alert queue, domain dashboards, workflows, module settings |
| **Leadership** (`/leadership`) | Decision makers | Conversational analytics, policy sandbox, database-backed reports |

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4 + custom design tokens
- **Database:** SQLite via Prisma
- **Maps:** Leaflet (Carto dark basemap)
- **AI:** Google Gemini (`GEMINI_API_KEY`)
- **Charts:** Recharts
- **State:** Zustand

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=your_key_here          # optional — AI falls back to simulation without it
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Set up the database

```bash
npm run db:push      # create SQLite schema
npm run db:seed      # optional — loads sample alerts/metrics into DB
```

> **Note:** The UI shows **only database records** — no hardcoded dummy telemetry. Without seeding, dashboards display helpful empty states.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── citizen/              # Citizen portal (chat, report, services)
│   ├── operator/             # Operator dashboard & domain views
│   ├── leadership/           # Analytics, simulate, reports
│   └── api/                  # REST routes (alerts, metrics, ask, workflows)
├── components/
│   ├── maps/CityMap.tsx      # Leaflet map component
│   ├── ui/                   # PageHeader, CitySelector, MapPanel, EmptyState
│   └── dashboard/Sidebar.tsx
├── lib/
│   ├── ai/                   # Gemini, RAG, domain agents
│   ├── config/services.ts    # Static municipal contact directory
│   └── mock/data.ts          # Domain definitions only (not shown as live data)
├── stores/                   # Zustand stores (city selection, alerts)
└── types/                    # TypeScript definitions
prisma/
├── schema.prisma             # Database models
└── seed.ts                   # Optional seed data
```

## Using the app

### City selector

Use the **City** dropdown in the top bar (Citizen, Operator, and Leadership portals). It recenters maps and translates place names — it does not fabricate sensor readings.

### Citizen — Report an issue

1. Go to **Citizen → Report**
2. Pick a category → describe the issue → pin location on the map
3. Submit (stored in SQLite when API is wired)

### Operator — Monitor alerts

1. Go to **Operator → Overview** for the incident map and alert feed
2. Open **Alerts** to triage by severity/status
3. Browse **Domains** in the sidebar for per-department metrics

### Leadership — Ask questions

1. Go to **Leadership → Analytics**
2. Type a natural-language question
3. Answers use RAG over policy docs + live DB context

## API routes

| Route | Description |
|-------|-------------|
| `GET /api/data/alerts` | All alerts |
| `GET /api/data/[domain]/alerts` | Domain alerts |
| `GET /api/data/[domain]/metrics` | Latest metrics |
| `GET /api/data/[domain]/geo` | Geolocated markers |
| `GET /api/data/[domain]/timeseries` | Metric history |
| `POST /api/ask` | AI Q&A with grounding |
| `GET /api/workflows` | Workflow list |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply Prisma schema |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## Troubleshooting

### Map overlaps UI or won't interact

- Maps are contained inside `MapPanel` with fixed height and `overflow: hidden`
- The city selector sits above the map (`z-index: 50`)
- If tiles look clipped after resize, refresh the page (Leaflet `invalidateSize` runs on mount)

### Empty dashboards

This is expected with a fresh database. Run `npm run db:seed` or add records via Prisma Studio / citizen reports.

### AI returns simulated responses

Set `GEMINI_API_KEY` in `.env` and restart the dev server.

## License

Built for SIH 2026 — see repository for license details.
