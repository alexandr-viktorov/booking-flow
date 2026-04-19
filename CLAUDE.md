# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npx playwright test                        # Run all E2E tests
npx playwright test --grep "test name"     # Run a single test
npx playwright test path/to/test.spec.ts   # Run a specific test file
```

## Architecture

This is a Next.js **16.2.4** app (non-standard version — APIs may differ from training data) using React 19.2.4 and the **App Router**. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`.

### Key conventions in this version

- **`params` is a Promise** in dynamic routes — always `await params` before accessing its values:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```

- **Layouts and pages are Server Components by default.** Add `'use client'` only when the component needs state, event handlers, lifecycle hooks, or browser APIs. Keep `'use client'` boundaries as narrow as possible.

- **Server Functions / Server Actions** use `'use server'` — either inline in an async function or at the top of a file to export multiple actions. Always verify auth inside every Server Function (they are reachable via direct POST).

- **Instant navigations**: `Suspense` boundaries alone are not enough. Export `unstable_instant` from routes that should navigate instantly, and wrap only uncached data fetches in `<Suspense>`. See `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.

- **Environment variables**: only `NEXT_PUBLIC_` prefixed vars are exposed to the client bundle.

### Stack

- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss` — different config from v3, see `node_modules/next/dist/docs/01-app/02-guides/tailwind-v3-css.md` if migrating)
- **Validation**: Zod v4
- **Class merging**: clsx
- **Testing**: Playwright (E2E only — no unit test framework configured)

### Path aliases

`@/*` maps to the project root (e.g. `@/app/...`, `@/lib/...`).

### Routing (App Router)

- Files named `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` have special meaning.
- Folders define URL segments; a route is only public when a `page.tsx` or `route.ts` exists.
- Use `(group)` folders for organization without affecting URLs.
- Use `_folder` prefix for non-routable colocated files (components, utils, etc.).

## Booking flow

The entire UI lives at `/booking` (`app/booking/page.tsx`), which is a single `'use client'` page that renders one of four step components based on `state.currentStep`. There is no multi-page routing between steps.

**State** is managed entirely in `hooks/useBookingStore.ts` via `useState`. The store is not persisted. `setWasteType()` must be used (not `update()`) when changing waste type — it resets downstream skip and plasterboard state as a side effect.

**Step flow**: PostcodeStep (1) → WasteTypeStep (2) → SkipStep (3) → ReviewStep (4). ReviewStep calls `/api/booking/confirm` and on success renders a confirmation panel inline (no navigation).

**API routes** (`app/api/`) are thin handlers backed by in-memory fixture data in `lib/fixtures/`:
- `postcode/lookup` — returns addresses from `lib/fixtures/addresses.ts`
- `skips` — calls `getSkips(heavyWaste)` from `lib/fixtures/skips.ts`; disables 2-yard and 4-yard skips when `heavyWaste: true`
- `waste-types` — accepts waste type selection
- `booking/confirm` — generates a `BK-XXXX` booking ID

**Pricing** is applied in ReviewStep, not in the API. Surcharges: heavy waste +£20, plasterboard (mixed) +£40.

## E2E automation

Tests live in `automation/e2e/`. The automation layer uses the Page Object Model:
- **Page objects** in `automation/pages/` wrap locators and actions for each step
- **Fixtures** in `automation/fixtures.ts` extend Playwright's `test` to inject page objects — import `{ test, expect }` from `../fixtures`, not from `@playwright/test`
- **Test data** is in `automation/test-data.ts` — `BookingScenario` objects (`generalWasteScenario`, `heavyWasteScenario`, `plasterboardScenario`) centralise all hardcoded strings and prices used across specs. Import with a short alias: `import { generalWasteScenario as d } from '../test-data'`
- **Enums** for waste type, skip size, and plasterboard option live under `automation/pages/` alongside the page objects that use them

> **Note**: there is a duplicate `automation/test-data/test-data.ts` (subdirectory). The canonical file is `automation/test-data.ts` (root of `automation/`). The subdirectory version should be removed.

All specs use `test.step()` for every logical action, with the step description matching the action (no numbering prefix).
