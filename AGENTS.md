# AGENTS.md — ark-games-shop

## Project Overview

Digital storefront for games and software licenses. Next.js 15 (App Router) + React 19 + TypeScript, deployed on Vercel. Backend is a separate NestJS service on Railway.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (fails on type errors)
npm run start        # Preview production build
npm run lint         # ESLint check
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
npm run test:coverage # Vitest with coverage
npm run clean-dev    # rm -rf .next && npm run dev
npm run clean-build  # rm -rf .next && npm run build
npm run clean-install # rm -rf node_modules && npm ci
```

**Required env vars** (`.env.local`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`. Without these, `npm run build` fails in production. Dev mode warns but continues. Node `>=18.18.0` required.

## Architecture

### All pages are `'use client'`

Every page under `src/app/` is a client component. There are no Server Components doing data fetching. All data is fetched client-side via `apiClient`. When adding new pages, follow this pattern — do not convert to Server Components unless explicitly requested.

### API Client (`src/services/api.ts`)

Singleton `apiClient` class (`ApiClientClass`):

- Bearer token auth (stored in localStorage)
- Automatic token refresh (30-min lifetime, refreshes 5 min before expiry)
- Auto-logout after 10 min of inactivity (unless `rememberMe` is set)
- Namespaced endpoints: `apiClient.admin.*`, `apiClient.products.*`, `apiClient.paymentsAdmin.*`, etc.
- Returns `{ data: T, status: number }` wrapped responses
- Uses `as unknown as Record<string, unknown>` casts for typed payloads — this is intentional, do not "fix"
- 401 responses trigger automatic token refresh + single retry

### State Management

Two Zustand stores with localStorage persistence:

- **`src/stores/auth-store.ts`** — `useAuthStore`: user, isLoading, isAuthenticated. Storage key: `ark-shop-auth`.
- **`src/stores/cart-store.ts`** — `useCartStore`: items, addItem, removeItem, etc. Storage key: `ark-shop-cart`.

Use selectors to avoid unnecessary re-renders: `useAuthStore((s) => s.isAuthenticated)` not `useAuthStore()`.

**Zustand `onRehydrateStorage`**: Always set `isLoading: false` in the callback, even when `state` is null (no persisted data). The initial state is `isLoading: true` to cover hydration delay — if the callback skips setting it when `state` is null, the store stays loading forever.

### Directory Structure

```
src/
  app/           # Next.js App Router pages (~39 routes)
    admin/       # Admin panel (users, products, orders, sellers, coupons, keys, etc.)
    products/    # Product listing + [slug] detail
    cart/        # Shopping cart
    checkout/    # Checkout flow
    dashboard/   # User dashboard
    search/      # Search with filters
  components/    # UI components (shadcn/ui in components/ui/)
  hooks/         # Custom React hooks (use-auth, use-upload, use-cart, etc.)
  lib/           # env.ts (env validation), utils.ts (cn, formatPrice, extractApiError), validations.ts (Zod schemas)
  middleware.ts  # Edge middleware: admin route defense-in-depth + security headers
  services/      # api.ts (ApiClientClass singleton)
  stores/        # Zustand stores (auth, cart)
  tests/         # Test setup
  types/         # api.ts (all API types/interfaces)
```

## Conventions

### Commit Messages

Conventional Commits enforced by Husky hook: `<type>(<scope>)?: <description>`
Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, `revert`.

### Pre-commit

`lint-staged` runs `eslint --fix` and `prettier --write` on `*.{ts,tsx}` and `prettier --write` on `*.{css,json,md}`.

### Type Safety

- `strict: true` in tsconfig
- All API types live in `src/types/api.ts`
- When typing form state that maps to an API payload, use the payload type explicitly (e.g., `useState<AdminUpdateUserPayload>(...)`) — TypeScript widens string literals to `string` otherwise.
- HTML `<select>` `e.target.value` is always `string`; cast to the expected union type when assigning to typed state.

### Validation

- Zod v4 used in `src/lib/validations.ts` (login, register, checkout, contact forms)
- `extractApiError(err, fallback)` in `src/lib/utils.ts` — always use this for error message extraction from API calls

### Auth & Route Protection

- Frontend/backend are on different domains (Vercel/Railway), so httpOnly cookies from the backend are not visible to middleware.
- Admin routes are protected client-side via `useAuth()` in `src/app/admin/layout.tsx`.
- `src/middleware.ts` provides defense-in-depth cookie check for `/admin/*` paths.
- When working on admin pages, assume the user is already authenticated; the layout handles redirects.

### Styling

- Tailwind CSS v3 with shadcn/ui components
- Color palette: neutral backgrounds, violet accents, emerald for success states
- `src/lib/utils.ts` has `cn()` (clsx + tailwind-merge) and `formatPrice()` (pt-BR locale, e.g., `29,90`)

### Deployment

- Deployed on Vercel with build cache
- `output: 'standalone'` in next.config.ts
- Security headers configured in next.config.ts (CSP, HSTS, X-Frame-Options, etc.)
- `images.remotePatterns` allows all HTTPS hosts (backend CDN)

## Testing

- Vitest with jsdom environment, globals enabled
- Test files: `src/**/*.test.{ts,tsx}`
- Setup file: `src/tests/setup.ts`
- `@testing-library/react` available

## Gotchas

- **Barrel imports**: `src/components/admin/products/index.ts` re-exports components. Import directly from source files when possible to avoid pulling unused code.
- **framer-motion**: Imported statically across many pages. Consider `next/dynamic` for pages where animations are not critical to initial paint.
- **Missing deps in hooks**: Several `useEffect`/`useCallback` hooks have missing dependency warnings. These are intentional in some cases but should be reviewed when touching those files.
- **localStorage keys**: `ark-shop-auth` (auth store), `ark-shop-cart` (cart store), `auth_token`/`auth_refresh_token`/`auth_remember_me` (api client). Don't collide with these.
- **env.ts browser check**: `env.ts` skips validation in the browser because `process.env` is `{}` at runtime in client bundles. Validation only runs on server (build time / SSR).
