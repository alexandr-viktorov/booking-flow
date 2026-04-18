# Booking Flow

A UK skip hire booking wizard built with Next.js 16, React 19, and Tailwind CSS v4.

## Overview

A 4-step booking wizard that guides users through selecting a skip for waste removal:

1. **Postcode & Address** — UK postcode lookup with manual entry fallback
2. **Waste Type** — General, heavy, or plasterboard (with handling options)
3. **Skip Size** — Available sizes and pricing, filtered by waste type
4. **Review & Confirm** — Price breakdown with surcharges and booking confirmation

## Tech Stack

| Package | Version |
|---------|---------|
| Next.js | 16.2.4 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| Zod | ^4 |
| Playwright | ^1.59 |

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- Docker & Docker Compose (for containerised deployment)

### Local Development

```bash
npm install
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000` | Base URL for API calls from the client |

Create a `.env.local` file at the project root to override defaults.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # Run ESLint

npx playwright test                         # Run all E2E tests
npx playwright test --grep "test name"      # Run a single test by name
npx playwright test path/to/test.spec.ts    # Run a specific test file
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/postcode/lookup` | POST | Look up UK addresses by postcode |
| `/api/waste-types` | POST | Validate waste type configuration |
| `/api/skips` | GET | List available skip sizes filtered by waste type |
| `/api/booking/confirm` | POST | Submit a booking and receive a booking reference |

## Project Structure

```
app/
  api/              # API route handlers
  booking/          # Booking wizard page
  globals.css       # Global styles
  layout.tsx        # Root layout
components/
  steps/            # PostcodeStep, WasteTypeStep, SkipStep, ReviewStep
  ui/               # LoadingState, ErrorState, EmptyState, ProgressBar
hooks/
  useBookingStore.ts  # Wizard state management
lib/
  fixtures/         # Mock data for addresses and skips
  types.ts          # Shared TypeScript interfaces
  validators/       # UK postcode validation
automation/
  e2e/              # Playwright E2E test specs
  pages/            # Page Object Models (POM) per step
  fixtures.ts       # Custom test fixtures wiring page objects
  seed.spec.ts      # Seed file for test setup
```

## E2E Tests

Tests live under `automation/` and use the Page Object Model pattern. Each booking flow variant has its own spec:

| Spec | Flow |
|------|------|
| `e2e/heavy-waste-booking-flow.spec.ts` | Heavy waste → 6-yard skip (£160 + £20 surcharge) |
| `e2e/general-waste-booking-flow.spec.ts` | General waste → 4-yard skip (£120, no surcharge) |
| `e2e/plasterboard-waste-booking-flow.spec.ts` | Plasterboard (mixed) → 4-yard skip (£120 + £40 surcharge) |

Page objects are in `automation/pages/` with one class per wizard step. Enums (`WasteType`, `SkipSize`, `PlasterboardOption`) map human-readable names to `data-testid` values used in the app.

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build -d
```

App is available at [http://localhost:3000](http://localhost:3000).

The container runs as a non-root user on port 3000 internally, mapped to host port 3200. It uses Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) for a minimal production image.
