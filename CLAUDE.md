# CLAUDE.md — eritreantourism.com

Persistent context for Claude Code sessions. Read this fully before making changes.

## What this project is

**eritreantourism.com** is a directory-first tourism platform for Eritrea: hotels, restaurants, tours, car rentals, points of interest, events, and practical travel info. The core business model is acting as a **payment intermediary** — international visitors pay in USD online (Stripe, currently simulated), and a local settlement partner handles last-mile payouts to Eritrean businesses that cannot accept online payments.

Revenue: service fees on bookings; later, premium directory listings, affiliate integrations, and a website-building/hosting service for local businesses.

**Vertical status:**
- **Hotels (Stay)** — LIVE. Booking flow works end-to-end with Supabase persistence.
- **Restaurants (Eat)** — LIVE. Config-driven template engine (25 theme presets) at `/eat` and `/eat/:slug`; reservation-request flow works end-to-end (`status = 'requested'`, confirmation-only, no payment). All 10 current listings are fictional seed data (`site_config.is_seed = true`, `noindex`ed) pending real partners. See `docs/restaurant-templates-migration-plan.md` and `apps/web/src/features/restaurants/`.
- Tours, car rentals, POIs, events — planned, will follow the same listing pattern.

## Tech stack

- **Frontend:** Vite + React + Tailwind CSS + React Router (react-helmet-async for SEO heads)
- **Backend/DB:** Supabase — project `https://qipuocrdarhmoagckzww.supabase.co` (Postgres + RLS + Storage)
- **Deploy:** Netlify, auto-deploys from `main`
- **DNS:** Cloudflare · **Payments:** Stripe (simulated for now) · **VCS:** GitHub Desktop → `github.com/tstesfamariam/eritreantourism`

## Repo structure

```
apps/web/src/
  App.jsx               # legacy view-state-machine app (hotels, explore, partner portal) — mounted at "/*"
  main.jsx              # router root: BrowserRouter + HelmetProvider, routes /eat, /eat/:slug, /* → App
  lib/                  # supabaseClient.js, bookingApi.js (hotels), theme.js (shared flag-palette tokens)
  features/restaurants/ # the restaurant vertical: themes.js, seo.js, api.js, RestaurantSite.jsx, sections/
  pages/                # routed pages: EatIndex.jsx (/eat), RestaurantPage.jsx (/eat/:slug)
db/migrations/          # Numbered SQL migrations — run manually in Supabase SQL editor. NOTE: 002-004 are
                         # missing from this repo (applied directly in Supabase, never committed) — see the
                         # hard-won lesson below before assuming a migration number or constraint name.
docs/                   # Plans and specs
_incoming/              # Prototypes/source material awaiting integration (not imported by the app)
```

## Immutable rules — do not violate

1. **Design palette is the Eritrean flag, not colonial-era tones.** Highland green, independence red, Red Sea blue, olive-wreath gold. This carries cultural and generational meaning. Never introduce an "Italian colonial" palette as the site identity. (Per-restaurant *themes* may use their own palettes — the rule applies to the platform's own brand surfaces: nav, directory pages, checkout.)
2. **One generalized schema.** All verticals live in the `listings` table with a `listing_type` field. Never create a separate table per category (no `restaurants` table, no `tours` table). Vertical-specific content goes in `site_config` jsonb.
3. **Template engine over duplication.** One config-driven component tree per vertical + theme presets. Never fork a template into a per-business copy.
4. **Migrations are append-only.** New numbered file in `db/migrations/`; never edit an already-applied migration.
5. **Never auto-deploy risky work.** `main` deploys straight to production via Netlify. Feature work happens on branches; merge only after the Netlify deploy preview is checked on mobile.

## Architecture & conventions

- **Data model:** `partners` (the business) → `listings` (what's bookable/listable, with `listing_type`, `slug`, `requires_payment`, `theme_id`, `site_config`) → `bookings` (+ `guests`). Hotels have `requires_payment = true`; restaurants are confirmation-only (`requires_payment = false`, reservation requests get `status = 'requested'`).
- **Runtime theming uses inline styles / CSS variables, not Tailwind classes.** Tailwind cannot resolve dynamic hex values at runtime without safelisting. Tailwind is for structural utilities only.
- **Data access goes through `apps/web/src/lib/`** (`bookingApi.js` pattern). UI components never import the Supabase client directly.
- **SEO on every public page:** title, meta description, canonical URL, OpenGraph, and schema.org JSON-LD (Hotel / Restaurant / etc.). Slugs are stable and lowercase-hyphenated.
- **Seed data is fictional** (Asmara Palace, Crystal Hotel, the 10 seed restaurants). Seed pages must be `noindex` / excluded from the sitemap until replaced by real partners. Prefer an `is_seed` flag in `site_config` so going live is a data change, not a deploy.

## Hard-won lessons (do not relearn these)

- **RLS must cover every operation on every table a flow touches.** A missing `SELECT` policy on `guests` once silently blocked booking creation. When adding a flow, audit RLS on all tables involved and test from an anonymous session (incognito), not the dashboard.
- **State belongs in Supabase, not localStorage.** Bookings were once localStorage-only; never persist business data client-side.
- **Mobile first, verified last.** Final gate before merging any UI work: Netlify deploy preview at 375px width. Watch heroes (clipping), menus, and forms.
- **A new vertical reusing a shared table needs its CHECK constraints widened, not just new columns.** `bookings.status` and `listings.listing_type` were both written with only hotels' enum values in mind. Adding restaurants (`listing_type = 'restaurant'`, `status = 'requested'`) required a follow-up migration (`007_bookings_status_requested.sql`) after the first insert failed with a `23514` check-constraint violation — the columns existed, the allowed *values* didn't. Before wiring a new vertical's writes, read the actual `check (... in (...))` clauses in the migrations, don't assume the existing enum covers it.
- **Diagnose Supabase write failures from the actual error object, not the symptom.** RLS violations and CHECK-constraint violations both surface as a generic failed insert, but have distinct Postgres error codes (`42501`-class vs `23514`) and different fixes. Log `err.code`/`err.message` from the client (or query `pg_policies` / the migration files) before hypothesizing which one it is.
- **`db/migrations/002` through `004` are missing from this repo** — applied directly in the Supabase SQL editor and never committed. Don't assume a migration file exists just because CLAUDE.md or another migration's comment references it (e.g. "the `004_fix_guests_select.sql` pattern"); check `db/migrations/` directly, and when altering a constraint whose defining migration isn't in the repo, look its name up dynamically (`pg_constraint` / the actual error message) rather than guessing Postgres's default naming.

## Workflow for Claude Code sessions

1. Read this file, the latest files in `db/migrations/`, and `apps/web/src/lib/bookingApi.js` before writing code.
2. Work on a feature branch, never directly on `main`.
3. For schema changes: write the migration file, but the human runs it in the Supabase SQL editor and confirms before dependent code is assumed working.
4. After completing a vertical or significant feature, update this file's "Vertical status" and add any new lessons.

## Current focus

Restaurant vertical integration (prototype → `/eat` + `/eat/:slug`, migrations `006`/`007`, reservation requests, SEO, noindex on seeds) is complete on the `restaurants-vertical` branch — see Vertical status above. Remaining before merge to `main`: Netlify deploy preview check at 375px width (immutable rule #5 / the mobile-first hard-won lesson), and a manual click-through of the hotel booking flow to confirm the `App.jsx` router-mounting change (see Repo structure) didn't regress it.

Next vertical candidates: tours, car rentals, POIs — same `listings.listing_type` + `site_config` pattern the restaurants vertical established.
