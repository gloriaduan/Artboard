Update this file whenever major or significant code changes make any guidance here stale.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Museum Collage Agent Notes

Last reviewed: 2026-06-21.

## Current Stack

- Next.js 16.2.6 App Router with React 19.2.4 and TypeScript strict mode.
- `cacheComponents: true` is enabled in `next.config.ts`; follow the Cache Components model, not older route-level caching assumptions.
- Styling uses Tailwind CSS 4 plus DaisyUI 5 in `app/globals.css`. Most UI uses utility classes; `components/AuthNavbar.tsx` uses `components/AuthNavbar.module.css`.
- Data/auth uses Prisma 7.8 with a generated client under `prisma/generated`, Neon via `@prisma/adapter-neon`, and Better Auth email/password auth.
- Artwork data comes from the Art Institute of Chicago API through `lib/aic.ts`.

## Project Layout

- `app/` contains the App Router surface:
  - `app/page.tsx` is the only page route. It checks the Better Auth session and renders either the public landing experience or the authenticated dashboard.
  - `app/layout.tsx` defines fonts, metadata, and the root HTML/body shell.
  - `app/api/artworks/route.ts` proxies paginated/search artwork requests.
  - `app/api/auth/[...all]/route.ts` exposes Better Auth GET/POST handlers.
- `components/` contains shared UI:
  - Public landing: `Navbar`, `LandingPage`, `Marquee`, `SignInModal`, `SignUpModal`.
  - Authenticated app: `AuthNavbar`, `Dashboard`, `ArtworkGallery`, `ArtworkCard`, `ArtworkSkeleton`.
- `lib/` contains shared application logic:
  - `lib/auth.ts` is server-only Better Auth and Prisma setup.
  - `lib/auth-client.ts` is the browser auth client.
  - `lib/aic.ts` is server-only cached artwork fetching.
  - `lib/aic-types.ts` contains AIC types and image URL helpers.
- `prisma/schema.prisma` is the source of truth for database models. `prisma/generated/` is generated output and should not be edited by hand.
- `public/landing/` contains the landing-page artwork images used by `Marquee`.

## Runtime Behavior

- `/` renders a Suspense-wrapped server session check. Authenticated users see `AuthNavbar` plus `Dashboard`; anonymous users see `Navbar` plus `LandingPage`.
- `/api/artworks` accepts `page`, `limit`, and optional `q`. Without `q`, it fetches boosted AIC artworks. With `q`, it performs AIC search.
- `/api/auth/[...all]` is owned by Better Auth through `toNextJsHandler(auth)`.
- `ArtworkGallery` is a client component using `@tanstack/react-virtual` for infinite scrolling and fetches more pages through `/api/artworks`.
- `ArtworkCard` intentionally uses a plain `<img>` for AIC IIIF images. Do not switch it to `next/image` without re-checking the AIC CDN behavior; the current comment notes that proxying through Next.js can return 403s.

## Implementation Rules

- Before changing Next.js APIs, routing, caching, config, or file conventions, read the matching docs in `node_modules/next/dist/docs/` and heed deprecation notices.
- Because Cache Components are enabled, uncached async work that affects rendering generally needs an appropriate Suspense boundary. Use `"use cache"`, `cacheLife`, and cache tags only according to current Next.js 16 docs.
- Keep server-only imports out of client components. `lib/auth.ts` and `lib/aic.ts` import `server-only`; client components should use `/api/*`, `lib/auth-client.ts`, or shared type/helper modules that do not import server-only code.
- Preserve the App Router organization: route files in `app/`, reusable UI in `components/`, and shared logic in `lib/`.
- Use the `@/*` TypeScript path alias for project-root imports when it matches nearby code.
- Prefer the existing Tailwind/DaisyUI style for new UI unless modifying the CSS-module navbar directly.

## Database and Auth

- `DATABASE_URL` is required for Prisma/Neon and is read by `lib/auth.ts` and `prisma.config.ts`.
- The Prisma models are `User`, `Session`, `Account`, `Verification`, and `SavedArtwork`.
- `SavedArtwork` exists in the schema and migrations, but the current UI does not yet expose save/board behavior.
- When changing Prisma models, update `prisma/schema.prisma`, create a migration, and regenerate the Prisma client in `prisma/generated/`.
- Do not hand-edit files under `prisma/generated/`.

## Commands

- `npm run dev` starts the Next.js dev server.
- `npm run build` runs the production build.
- `npm run start` serves a built app.
- `npm run lint` runs ESLint.

Run at least `npm run lint` after code changes when practical. Run `npm run build` for routing, caching, auth, or data-fetching changes, noting that database-backed paths require valid environment configuration.
