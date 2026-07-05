# CityMind

**AI-Powered Decision Intelligence Platform for Smart Cities**

Built for [Smart India Hackathon 2026](https://www.sih.gov.in/). CityMind connects citizens, city operators, and leadership through three purpose-built portals, 12 municipal domains, live maps, and a Gemini-powered AI assistant grounded in your database and policy documents.

---

## Screenshots

> Landing page with city selector → Operator dashboard → AI chat

---

## What it does

| Portal | Who it's for | Key features |
|---|---|---|
| **Citizen** `/citizen` | Residents | AI chat assistant, issue reporting with map pin, services directory |
| **Operator** `/operator` | City staff | Live alert queue, domain dashboards, workflow automation, module settings |
| **Leadership** `/leadership` | Decision makers | Conversational analytics, policy sandbox, AI-generated reports |

### City selector

Every portal (including the landing page) shows a **City** dropdown in the top bar. Switching cities:

- Recenters the map to the selected city
- Translates locality names in alerts and incident titles
- Works across all 6 supported cities (New Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad)

> The selector does **not** fabricate sensor readings — it only repositions map coordinates and substitutes place names.

### 12 domains

Mobility · Safety · Health · Education · Environment · Waste · Energy · Civic Engagement · Accessibility · Disaster Response · Tourism · Community

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS 4 + custom CSS design tokens |
| Database | SQLite via Prisma ORM |
| Maps | Leaflet + react-leaflet (Carto dark basemap) |
| AI | Google Gemini (`@google/generative-ai`) |
| Embeddings / RAG | `@xenova/transformers` (local, no external API) |
| Charts | Recharts |
| State management | Zustand |
| Animations | Framer Motion |

---

## Quick start

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
GEMINI_API_KEY=your_key_here          # optional — AI falls back to simulation without it
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Set up the database

```bash
npm run db:push      # create SQLite schema from prisma/schema.prisma
npm run db:seed      # optional — loads sample alerts, metrics, and users
```

> Without seeding, dashboards show helpful empty states. Add records anytime via Prisma Studio or by submitting citizen reports.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
citymind/
├── prisma/
│   ├── schema.prisma          # Database models (User, Alert, Metric, Workflow…)
│   ├── seed.ts                # Optional sample data loader
│   └── dev.db                 # SQLite database file (git-ignored)
│
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (role selector + city picker)
│   │   ├── citizen/           # Citizen portal
│   │   │   ├── chat/          # AI assistant chat interface
│   │   │   ├── report/        # Issue reporting with map pin
│   │   │   └── services/      # Municipal services directory
│   │   ├── operator/          # Operator dashboard
│   │   │   ├── page.tsx       # Overview: incident map + alert feed
│   │   │   ├── alerts/        # Full alert triage table
│   │   │   ├── workflows/     # Workflow approval queue
│   │   │   ├── settings/      # Module configuration
│   │   │   └── [domain]/      # Per-domain detail page
│   │   ├── leadership/        # Leadership console
│   │   │   ├── analytics/     # Conversational AI analytics
│   │   │   ├── simulate/      # Policy scenario sandbox
│   │   │   └── reports/       # AI-generated report browser
│   │   └── api/               # REST API routes
│   │       ├── ask/           # POST /api/ask — AI Q&A with RAG
│   │       ├── chat/          # POST /api/chat — streaming chat
│   │       ├── upload/        # POST /api/upload — document ingestion
│   │       ├── workflows/     # GET/POST /api/workflows
│   │       └── data/
│   │           ├── alerts/    # GET /api/data/alerts — all alerts
│   │           └── [domain]/  # Domain-scoped endpoints
│   │               ├── alerts/
│   │               ├── metrics/
│   │               ├── geo/
│   │               └── timeseries/
│   │
│   ├── components/
│   │   ├── charts/
│   │   │   └── DomainChart.tsx        # Recharts bar/line/area wrapper
│   │   ├── dashboard/
│   │   │   └── Sidebar.tsx            # Collapsible navigation sidebar
│   │   ├── maps/
│   │   │   └── CityMap.tsx            # Leaflet map (SSR-safe, dynamic import)
│   │   └── ui/
│   │       ├── CitySelector.tsx       # City dropdown (synced to Zustand store)
│   │       ├── MapPanel.tsx           # Map embedded in a panel card
│   │       ├── PageHeader.tsx         # Consistent page title + description
│   │       └── EmptyState.tsx         # Empty / zero-data placeholder
│   │
│   ├── lib/
│   │   ├── ai/                        # Gemini integration + RAG pipeline
│   │   ├── config/services.ts         # Static municipal contact directory
│   │   ├── db/prisma.ts               # Shared Prisma client (singleton)
│   │   └── mock/data.ts               # Domain config definitions
│   │
│   ├── stores/
│   │   └── dashboardStore.ts          # Zustand: city, alerts, markers, live data
│   │
│   └── types/
│       └── index.ts                   # All TypeScript types / interfaces
│
├── .env.example
├── next.config.ts
├── prisma.config.ts
├── tailwind.config (via postcss.config.mjs)
└── package.json
```

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Production build (Next.js) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:push` | Apply schema to SQLite (creates tables) |
| `npm run db:seed` | Populate database with sample data |
| `npm run db:studio` | Open Prisma Studio in browser |

---

## API reference

### Data endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/data/alerts` | All alerts across every domain |
| `GET` | `/api/data/domains` | List of enabled domain configs |
| `GET` | `/api/data/[domain]/alerts` | Alerts filtered to a single domain |
| `GET` | `/api/data/[domain]/metrics` | Latest metric values for a domain |
| `GET` | `/api/data/[domain]/geo` | Geolocated markers for a domain |
| `GET` | `/api/data/[domain]/timeseries` | Historical metric time series |

### AI / workflow endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/ask` | One-shot AI Q&A with RAG grounding |
| `POST` | `/api/chat` | Streaming conversational chat |
| `POST` | `/api/upload` | Ingest a document into the RAG store |
| `GET` | `/api/workflows` | List all workflows |
| `POST` | `/api/workflows` | Create a new workflow |
| `POST` | `/api/workflows/[id]/approve` | Approve or reject a pending workflow |

---

## Selecting a city

The city picker is available on **every page** — landing page, Citizen portal, Operator dashboard, and Leadership console.

1. Look for the **📍 City** dropdown in the top navigation bar
2. Choose from: New Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad
3. The map recenters instantly and place names in alerts update automatically

The selection is stored in Zustand (`dashboardStore`) and persists for the session across all portals.

---

## Citizen portal guide

### Chat

1. Navigate to **Citizen → Chat** (or type a question in the landing page search bar)
2. Ask in natural language: "What is the air quality in my area?" or "How do I pay my water bill?"
3. The AI assistant uses RAG over uploaded policy documents and live database context

### Report an issue

1. Navigate to **Citizen → Report**
2. Choose a category (pothole, streetlight, water leak, garbage, noise…)
3. Write a description and pin the location on the map
4. Submit — your report gets a tracking ID and appears in the Operator alerts queue

---

## Operator portal guide

### Overview dashboard

- Incident map centered on the selected city
- Live alert feed filtered by status
- Per-domain alert count chart
- Stats: active alerts, map markers, affected domains

### Alert triage

- Go to **Operator → Alerts**
- Filter by severity, status, or domain
- Acknowledge or resolve alerts directly from the table

### Domain dashboards

- Click any domain in the sidebar (e.g. Mobility, Energy)
- View domain-specific metrics, charts, and geolocated incidents

### Workflows

- Pending workflows appear in **Operator → Workflows**
- Approve or reject with an optional note
- Workflow actions execute sequentially after approval

---

## Leadership portal guide

### Analytics

- Navigate to **Leadership → Analytics**
- Ask strategic questions: "Show me energy consumption trends for last month"
- Answers include charts, citations, and suggested follow-up actions

### Simulate

- **Leadership → Simulate** lets you model policy changes
- Adjust parameters (e.g. bus frequency, park budget) and see projected impact

### Reports

- Pre-generated summaries appear in **Leadership → Reports**
- Request custom AI reports for any domain and date range

---

## Troubleshooting

**Dashboards are empty**
Run `npm run db:seed` to load sample data, or submit a citizen report to create real records. The UI intentionally shows only database records — no hardcoded dummy telemetry.

**AI returns simulated/fallback responses**
Set `GEMINI_API_KEY` in your `.env` file and restart the dev server. Without a key, the AI returns pre-scripted responses.

**Map tiles are blank or clipped**
Leaflet requires a client-side render. All map components use Next.js `dynamic(() => ..., { ssr: false })`. If tiles appear missing after a hot reload, do a full browser refresh.

**Build fails with TypeScript errors**
Run `npm run db:generate` first to regenerate the Prisma client, then `npm run build`.

**City selector not working**
The selector requires the Zustand `dashboardStore` to be initialized. It is mounted in all portal layouts and on the landing page — confirm you are not rendering the component outside those trees.

---

## License

Built for SIH 2026. See repository for license details.
