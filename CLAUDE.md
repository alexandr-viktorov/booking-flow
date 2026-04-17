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
