# Portfolio Frontend

Next.js 16 + React 19 client application for the full-stack portfolio project. Features a **dual-mode interface** — an interactive CLI terminal and a graphical dashboard — backed by a REST API with automatic offline fallback.

## Architecture

```
src/
├── app/                  # Next.js App Router (layout, page, global styles)
├── components/
│   ├── Terminal/         # CLI mode — interactive console with typed commands
│   │   └── Console.tsx
│   └── GUI/              # Dashboard mode — windowed cards (projects, skills, certs)
│       └── GuiView.tsx
├── hooks/
│   └── useApi.ts         # Data fetching hook with 3s timeout + fallback logic
├── lib/
│   └── fallbackData.ts   # Static offline cache data and shared TypeScript interfaces
└── __tests__/            # Jest + Testing Library unit tests
    ├── Console.test.tsx
    └── useApi.test.ts
```

## Dual-Mode Interface

| Mode | Component | Description |
|------|-----------|-------------|
| **Terminal (CLI)** | `Console.tsx` | Default view. Type commands (`help`, `whoami`, `projects`, `skills`, `certs`, `contact`, `gui`, `clear`) to navigate. Supports arrow-key command history and Tab completion. |
| **GUI (Dashboard)** | `GuiView.tsx` | Visual card-based layout with framer-motion animations. Switch from the terminal with the `gui` command. |

## API Integration & Offline Fallback

The `usePortfolioData` hook (`src/hooks/useApi.ts`) fetches projects, skills, and certifications from the backend API in parallel:

- **Timeout**: 3-second `AbortController` timeout per request.
- **Fallback**: If any request fails or times out, the hook loads static data from `fallbackData.ts` and sets `isFallback = true`.
- **Terminal logs**: The hook emits `[INFO]`, `[SUCCESS]`, `[ERROR]`, and `[WARN]` log messages that the Console component displays in real time.

The API base URL is configured via the `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:5000/api`).

## Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **framer-motion** — animations for GUI mode
- **lucide-react** — icons for GUI mode
- **Jest 29** + **@testing-library/react** — testing

## Getting Started

### Prerequisites

- Node.js v20.x or higher
- Backend API running (see [`../backend/README.md`](../README.md) or root `README.md`)

### Local Development

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev
```

### Docker

```bash
# From the repository root
docker compose up --build
```

The frontend container serves via Nginx in production mode (see `nginx.conf`).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests (single run) |
| `npm run test:watch` | Run Jest tests in watch mode |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:5000/api` | Backend API base URL |

See [`.env.example`](.env.example) for a reference template.

## Testing

Tests are located in `src/__tests__/` and use Jest with `jest-environment-jsdom` and `@testing-library/react`.

```bash
npm test            # single run
npm run test:watch  # watch mode
```
