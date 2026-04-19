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
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000` | Base URL for API calls from the client bundle |
| `BASE_URL` | `http://localhost:3000` | Base URL used server-side (e.g. Playwright, SSR fetches) |

Create a `.env.local` file at the project root to override defaults.

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build -d
```

App runs at [http://localhost:3000](http://localhost:3000).

## Commands

```bash
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
  api/              # API route handlers (postcode, waste-types, skips, booking/confirm)
  booking/          # Booking wizard page (single 'use client' page, all 4 steps)
  globals.css       # Global styles
  layout.tsx        # Root layout
components/
  steps/            # PostcodeStep, WasteTypeStep, SkipStep, ReviewStep
  ui/               # LoadingState, ErrorState, EmptyState, ProgressBar
hooks/
  useBookingStore.ts  # Wizard state — use setWasteType() (not update()) to reset downstream state
lib/
  fixtures/         # In-memory mock data: addresses.ts, skips.ts
  types.ts          # Shared TypeScript interfaces
  validators/       # UK postcode validation
automation/
  e2e/              # Playwright E2E test specs (one file per booking flow variant)
  pages/            # Page Object Models per wizard step; enums (WasteType, SkipSize, PlasterboardOption) colocated here
  test-data/
    test-data.ts    # BookingScenario objects — single source of truth for all test data
  fixtures.ts       # Extends Playwright test to inject page objects
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

## Mocking Approach

There is no mocking in this project — E2E tests run against the real Next.js app with its real API routes and in-memory fixture data.

The API routes (`/api/postcode/lookup`, `/api/skips`, etc.) are backed by `lib/fixtures/` — static data hardcoded on the server. From the test's perspective this behaves like a real backend: the browser makes actual HTTP requests, the server processes them, and the UI renders real responses.

- **No network interception** — Playwright does not stub or intercept any requests
- **No database mocks** — there is no database; fixture files *are* the data layer
- **Test data in `test-data.ts` must match fixture data** — e.g. `skipSizeDisplayPrice: '£160'` for the 6-yard skip works because `lib/fixtures/skips.ts` has `{ size: "6-yard", price: 160 }`. If a fixture changes, the corresponding scenario value must be updated too

Tests are more realistic (they catch real rendering and API integration issues) but will break if fixture data changes. For this scale of app — a single wizard with static data — it's the right tradeoff.

## E2E Test Data Strategy

All test data is centralised in `automation/test-data/test-data.ts` as typed scenario objects. Each spec imports one scenario and aliases it `testData`, keeping assertions readable without repeating literals.

### Structure

**One interface, three scenarios:**
```ts
interface BookingScenario {
  postcode, address, addressSummary   // postcode step
  wasteType, wasteTypeSummaryText     // waste type step
  plasterboardOption?                 // plasterboard step (optional)
  skipSize, skipSizeSummaryText,
  skipSizeDisplayPrice                // skip step
  price: { hire, heavySurcharge?,
    plasterboardSurcharge?, total }   // review step
  selectedClass: RegExp               // shared UI selection state
  selectedPlasterboardClass?: RegExp  // plasterboard-specific selection state
}
```

**Optional fields signal "not applicable"** — `heavySurcharge?` being absent on `generalWasteScenario` directly maps to `not.toBeVisible()` in the spec. `plasterboardOption?` only exists on the plasterboard scenario, so the non-null assertion `testData.plasterboardOption!` in that spec is always safe.

### What each spec owns

| Concern | In test-data | In spec |
|---|---|---|
| All string values, prices, enums | ✓ | |
| CSS selection classes | ✓ | |
| App behaviour (e.g. 2-yard/4-yard disabled for heavy waste) | | ✓ hardcoded |
| `not.toBeVisible()` surcharge assertions | | ✓ hardcoded |
| Step logic and flow order | | ✓ |

App behaviour assertions (disabled skips, absent surcharges) stay hardcoded in specs because they test how the app responds to the scenario — they're not data points of the scenario itself.

### Why named objects over `test.each`

The three flows differ structurally — plasterboard has an extra handling-method step, general waste has `not.toBeVisible()` assertions the others don't. Forcing them into a single parameterised table would require conditional logic inside the test body, making failures harder to diagnose. Separate specs with shared data objects give the same "one source of truth" benefit without merging structurally different flows.
