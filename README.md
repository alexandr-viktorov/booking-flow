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

## QA Artefacts

| File / Folder | Description |
|---|---|
| `manual-tests.md` | 40 manual test cases covering positive, negative, edge, API failure, and state transition scenarios across all 4 wizard steps |
| `bug-reports.md` | 5 bug reports found during exploratory testing, each with steps to reproduce, expected/actual results, and a screenshot |
| `ui/Flow video.mp4` | Screen recording of a full end-to-end booking flow |
| `ui/Screenshots/Desktop/` | Step-by-step desktop screenshots (001–009) |
| `ui/Screenshots/Mobile/` | Step-by-step mobile screenshots on Samsung Galaxy S8+ (101–109) |
| `ui/lighthouse-accessibility-report.html` | Lighthouse accessibility audit report |

## E2E Tests

Tests live under `automation/` and use the Page Object Model pattern. Each booking flow variant has its own spec:

| Spec | Flow |
|------|------|
| `e2e/heavy-waste-booking-flow.spec.ts` | Heavy waste → 6-yard skip (£160 + £20 surcharge) |
| `e2e/general-waste-booking-flow.spec.ts` | General waste → 4-yard skip (£120, no surcharge) |
| `e2e/plasterboard-waste-booking-flow.spec.ts` | Plasterboard (mixed) → 4-yard skip (£120 + £40 surcharge) |

Page objects are in `automation/pages/` with one class per wizard step. Enums (`WasteType`, `SkipSize`, `PlasterboardOption`) map human-readable names to `data-testid` values used in the app.

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

## Mocking Strategy for API Failure Tests

Four test cases require the server to return an error: **TC-009**, **TC-010**, **TC-025**, and **TC-033**. Each uses a different technique depending on whether the failure is built into the server fixtures or must be induced via the browser.

---

### Which technique applies to which test

| Test | Endpoint | Failure type | Technique |
|------|----------|--------------|-----------|
| TC-009 | `POST /api/postcode/lookup` | 500 on first attempt, 200 on retry | Built-in fixture — use postcode `BS1 4DJ`, no setup needed |
| TC-010 | `POST /api/postcode/lookup` | Network unreachable | DevTools → Network offline mode |
| TC-025 | `GET /api/skips` | 500 response | DevTools → Override content |
| TC-033 | `POST /api/booking/confirm` | 500 response | DevTools → Override content |

---

### Technique A — Built-in server fixture (TC-009)

No browser setup is required. The server already handles `BS1 4DJ` specially:

- **First call** → returns `500 Internal server error`
- **Second call** → returns `200` with address results

Simply enter `BS1 4DJ` as the postcode and follow the TC-009 steps. The retry counter resets automatically after a successful retry, so the test is repeatable without restarting the server.

> **Note:** The counter is per-process and resets on server restart. If something interrupted a previous test mid-retry, restart the app (`docker compose restart app`) to reset the counter.

---

### Technique B — DevTools network offline (TC-010)

This simulates a complete loss of network connectivity, causing `fetch()` to throw a network error rather than receiving any HTTP response.

**Setup:**

1. Open DevTools (`F12`) → **Network** tab
2. Find the **"No throttling"** dropdown at the top of the Network tab
3. Select **"Offline"** from the dropdown

**Teardown:**

After the test, set the dropdown back to **"No throttling"** (or "Online"). The app will resume making real requests immediately — no page reload needed.

> Offline mode blocks all network traffic for the tab, including browser navigation. Keep DevTools open and restore the setting as soon as the test is complete.

---

### Technique C — DevTools override content (TC-025, TC-033)

This is the recommended technique for forcing a specific HTTP status code (500) on a single endpoint while leaving all other requests unaffected.

Chrome's **"Override content"** feature intercepts a matched request and serves a locally edited response instead.

#### One-time setup (first time only)

1. Open DevTools (`F12`) → **Sources** tab → **Overrides** panel (left sidebar)
2. Click **"Select folder for overrides"**
3. Choose any local folder (e.g. `Desktop/devtools-overrides`)
4. Click **"Allow"** when Chrome asks for filesystem access
5. Check **"Enable Local Overrides"** if the checkbox appears

#### Creating an override for `/api/skips` (TC-025)

1. Navigate to Step 3 normally (complete steps 1–2 first) so Chrome records a `/api/skips` request
2. In the **Network** tab, find the `skips` request
3. Right-click it → **"Override content"**
4. Chrome opens the response body in the Sources editor
5. Replace the entire file content with:
   ```json
   {"error":"Internal Server Error"}
   ```
6. In the file header inside the Sources editor, change the **status code** to `500`  
   *(If the editor does not expose the status directly, use the Headers override: right-click the request → "Override headers", add `What is `)*
7. Save with `Ctrl+S`

The override is now active. Reload Step 3 to trigger a fresh fetch — the browser will serve your override instead of the real response.

#### Creating an override for `/api/booking/confirm` (TC-033)

Follow the same steps as above, but trigger the override after clicking "Confirm booking" on Step 4 so Chrome records the `confirm` request first:

1. Complete the full flow through to the Review step
2. Click **"Confirm booking"** once to make Chrome record the `confirm` request
3. Right-click the `confirm` request in the Network tab → **"Override content"**
4. Replace the body with `{"error":"Internal Server Error"}` and set status to `500`
5. Save — click **"Confirm booking"** again to observe the error state

#### Disabling an override after the test

- In the **Sources → Overrides** panel, uncheck the override file or uncheck **"Enable Local Overrides"**
- Or right-click the request in Network → **"Stop overriding"**
- Always disable overrides before moving to the next test case

> Overrides persist across page reloads and browser restarts until explicitly disabled. Always check the Overrides panel is clear before starting an unrelated test.