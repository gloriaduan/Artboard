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
- Artwork data comes from the Harvard Art Museums API through `lib/museum.ts` (requires `HARVARD_API_KEY`). It previously used the Art Institute of Chicago, switched away because AIC's `www.artic.edu` IIIF host began serving a site-wide Cloudflare bot-challenge (403) that a plain `<img>` can't pass.

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
  - `lib/museum.ts` is server-only cached artwork fetching (Harvard Art Museums).
  - `lib/museum-types.ts` contains the source-neutral `Artwork`/`ArtworkDetail` types, the `imageUrl(imageBase, width)` helper, and the Harvard→`Artwork` normalizers.
- `prisma/schema.prisma` is the source of truth for database models. `prisma/generated/` is generated output and should not be edited by hand.
- `public/landing/` contains the landing-page artwork images used by `Marquee`.

## Runtime Behavior

- `/` renders a Suspense-wrapped server session check. Authenticated users see `AuthNavbar` plus `Dashboard`; anonymous users see `Navbar` plus `LandingPage`.
- `/api/artworks` accepts `page`, `limit`, and optional `q`. Without `q`, it fetches the most-viewed Harvard paintings (`sort=totalpageviews`). With `q`, it performs a Harvard keyword search. Default feed is `classification=Paintings`, `hasimage=1`.
- `/api/auth/[...all]` is owned by Better Auth through `toNextJsHandler(auth)`.
- `ArtworkGallery` is a client component using paginated `@tanstack/react-query` (one page per click) with a CSS-columns masonry layout and DaisyUI numbered pagination. Not infinite scroll/virtualization — that was removed because bursty image loads tripped CDN rate limits.
- `ArtworkCard` intentionally uses a plain `<img>` hotlinking the museum image host (Harvard's `nrs.harvard.edu` resolver, which honors a `?width=` size param). Do not switch it to `next/image`; a server-side proxy can hit CDN bot-challenges (this is why AIC was abandoned).

## Implementation Rules

- Before changing Next.js APIs, routing, caching, config, or file conventions, read the matching docs in `node_modules/next/dist/docs/` and heed deprecation notices.
- Because Cache Components are enabled, uncached async work that affects rendering generally needs an appropriate Suspense boundary. Use `"use cache"`, `cacheLife`, and cache tags only according to current Next.js 16 docs.
- Keep server-only imports out of client components. `lib/auth.ts` and `lib/museum.ts` import `server-only`; client components should use `/api/*`, `lib/auth-client.ts`, or shared type/helper modules (e.g. `lib/museum-types.ts`) that do not import server-only code.
- Preserve the App Router organization: route files in `app/`, reusable UI in `components/`, and shared logic in `lib/`.
- Use the `@/*` TypeScript path alias for project-root imports when it matches nearby code.
- Prefer the existing Tailwind/DaisyUI style for new UI unless modifying the CSS-module navbar directly.

## Database and Auth

- `DATABASE_URL` is required for Prisma/Neon and is read by `lib/auth.ts` and `prisma.config.ts`. `HARVARD_API_KEY` is required for `lib/museum.ts`.
- The Prisma models are `User`, `Session`, `Account`, `Verification`, `SavedArtwork`, `Board`, and `BoardPlacement`.
- `SavedArtwork` stores `sourceId` (provider object id), `title`, and `imageBase` (provider image URL), unique per `[userId, sourceId]`. The save/board UI is live (`ArtworkModal`, `SavedGallery`, `BoardCanvas`).
- When changing Prisma models, update `prisma/schema.prisma`, create a migration, and regenerate the Prisma client in `prisma/generated/`.
- Do not hand-edit files under `prisma/generated/`.

## Commands

- `npm run dev` starts the Next.js dev server.
- `npm run build` runs the production build.
- `npm run start` serves a built app.
- `npm run lint` runs ESLint.

Run at least `npm run lint` after code changes when practical. Run `npm run build` for routing, caching, auth, or data-fetching changes, noting that database-backed paths require valid environment configuration.

# Design Context

- `PRODUCT.md` (project root) is the strategic design source of truth: register, users, brand personality, anti-references, and design principles. Read it before design work.
- Register: **product** (the authenticated browse/save/board app is primary; the landing page serves it).
- Intended direction: **playful, tactile, collage-y** — hands-on, scrapbook/pinboard feel, with the artwork always the hero. Note the current code is still a quiet dark theme; that direction is something to grow toward, not what's shipped yet. Anti-references: generic SaaS dashboard, sterile institutional museum site, cluttered UI, childish/cartoonish.
- `DESIGN.md` (when present) is the visual system source of truth (palette, type, components); it wins on visual decisions, PRODUCT.md wins on strategic/voice decisions.
