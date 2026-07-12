# CLAUDE.md — eritreantourism.com

Persistent context for Claude Code sessions. Read this fully before making changes.

## What this project is

**eritreantourism.com** is a directory-first tourism platform for Eritrea: hotels, restaurants, tours, car rentals, points of interest, events, and practical travel info. The core business model is acting as a **payment intermediary** — international visitors pay in USD online (Stripe, currently simulated), and a local settlement partner handles last-mile payouts to Eritrean businesses that cannot accept online payments.

Revenue: service fees on bookings; later, premium directory listings, affiliate integrations, and a website-building/hosting service for local businesses.

**Vertical status:**
- **Hotels (Stay)** — LIVE. Booking flow works end-to-end with Supabase persistence.
- **Restaurants (Eat)** — LIVE. Config-driven template engine (25 theme presets) at `/eat` and `/eat/:slug`; reservation-request flow works end-to-end (`status = 'requested'`, confirmation-only, no payment). All 10 current listings are fictional seed data (`site_config.is_seed = true`, `noindex`ed) pending real partners. See `docs/restaurant-templates-migration-plan.md` and `apps/web/src/features/restaurants/`. Merged to `main` via PR #1 (2026-07-09).
- **Front desk (hotel PMS)** — LIVE inside the partner portal (merged via PR #2, 2026-07-12). Hotels record *all* bookings — platform (paid online) and local (walk-in / phone / email) — so availability has one source of truth. Migration `009_frontdesk_invoices.sql` added `bookings.source` / `payment_method` / check-in-out lifecycle columns and an `invoices` table (per-partner numbered, jsonb line items). Business rule: commission + settlement apply **only** to `source = 'platform'` bookings; invoicing local bookings is a service we provide. API: `createFrontDeskBooking`, `checkInBooking`, `checkOutBooking`, `fetchInvoiceForBooking`, `createInvoice` in `bookingApi.js`.
- Tours, car rentals, POIs, events — planned, will follow the same listing pattern.

## Tech stack

- **Frontend:** Vite + React + Tailwind CSS + React Router (react-helmet-async for SEO heads)
- **Backend/DB:** Supabase — project `https://qipuocrdarhmoagckzww.supabase.co` (Postgres + RLS + Storage)
- **Deploy:** Netlify, auto-deploys from `main` — custom domain **eritreantourism.com** is LIVE (DNS setup complete, July 2026)
- **DNS:** Cloudflare · **Payments:** Stripe (simulated for now) · **VCS:** GitHub Desktop → `github.com/tstesfamariam/eritreantourism`

## Repo structure

```
apps/web/src/
  App.jsx               # view-state-machine app (home, explore, hotels, partner portal + front desk) — mounted at "/*"
  App-backup.jsx        # retained backup of the previous App design — not imported anywhere
  main.jsx              # router root: BrowserRouter + HelmetProvider, routes /eat, /eat/:slug, /* → App
  lib/                  # supabaseClient.js, bookingApi.js (hotels + front desk/invoices), theme.js (shared flag-palette tokens)
  features/restaurants/ # the restaurant vertical: themes.js, seo.js, api.js, RestaurantSite.jsx, sections/
  pages/                # routed pages: EatIndex.jsx (/eat), RestaurantPage.jsx (/eat/:slug)
db/migrations/          # Numbered SQL migrations — run manually in Supabase SQL editor. NOTE: 004 is
                         # missing from this repo (applied directly in Supabase, never committed; 002 and
                         # 003 were recovered and committed 2026-07-12) — see the hard-won lesson below
                         # before assuming a migration number or constraint name.
docs/                   # Plans and specs
_incoming/              # Prototypes/source material awaiting integration (not imported by the app)
```

## Immutable rules — do not violate

1. **Design palette is the Eritrean flag, not colonial-era tones.** Highland green, independence red, Red Sea blue, olive-wreath gold. This carries cultural and generational meaning. Never introduce an "Italian colonial" palette as the site identity. (Per-restaurant *themes* may use their own palettes — the rule applies to the platform's own brand surfaces: nav, directory pages, checkout.)
2. **One generalized schema.** All verticals live in the `listings` table with a `listing_type` field. Never create a separate table per category (no `restaurants` table, no `tours` table). Vertical-specific content goes in `site_config` jsonb.
3. **Template engine over duplication.** One config-driven component tree per vertical + theme presets. Never fork a template into a per-business copy.
4. **Migrations are append-only.** New numbered file in `db/migrations/`; never edit an already-applied migration. Always check existing migration numbers (in the repo *and* applied-but-uncommitted ones) before picking the next: the front-desk migration was drafted as `006` and had to be renamed `009_frontdesk_invoices.sql` because 006–008 were already taken by the restaurants-vertical work.
5. **Never auto-deploy risky work.** `main` deploys straight to production via Netlify. Feature work happens on branches; merge only after the Netlify deploy preview is checked on mobile.

## Architecture & conventions

- **Data model:** `partners` (the business) → `listings` (what's bookable/listable, with `listing_type`, `slug`, `requires_payment`, `theme_id`, `site_config`) → `bookings` (+ `guests`, `invoices`). Hotels have `requires_payment = true`; restaurants are confirmation-only (`requires_payment = false`, reservation requests get `status = 'requested'`). Bookings carry a `source` (`platform` / `walk_in` / `phone` / `email`); commission + settlement apply only to `platform` bookings.
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
- **`db/migrations/004` is missing from this repo** — applied directly in the Supabase SQL editor and never committed (`002_seed_hotels.sql` and `003_rls_policies.sql` were recovered and committed 2026-07-12). Don't assume a migration file exists just because CLAUDE.md or another migration's comment references it (e.g. "the `004_fix_guests_select.sql` pattern"); check `db/migrations/` directly, and when altering a constraint whose defining migration isn't in the repo, look its name up dynamically (`pg_constraint` / the actual error message) rather than guessing Postgres's default naming.

## Workflow for Claude Code sessions

1. Read this file, the latest files in `db/migrations/`, and `apps/web/src/lib/bookingApi.js` before writing code.
2. Work on a feature branch, never directly on `main`.
3. For schema changes: write the migration file, but the human runs it in the Supabase SQL editor and confirms before dependent code is assumed working.
4. After completing a vertical or significant feature, update this file's "Vertical status" and add any new lessons.
5. **This repo (via Claude Code sessions on this machine) is the source of truth for the codebase.** Conversational Claude's copies of files drift — a stale App.jsx from a chat once overwrote the front-desk build on `main` and had to be reverted from backup. Any externally-generated file changes must be patched onto the *current* repo file, never pasted over from an older copy, and must preserve CRLF line endings so diffs stay reviewable.

## Current focus

Recently landed on `main` (all merged):
- **Restaurants vertical** (PR #1, 2026-07-09) — see Vertical status.
- **Front desk / PMS + invoices** (PR #2, 2026-07-12) — migration `009`, `bookingApi.js` front-desk functions, `FrontDeskToday` / `NewBookingForm` / invoice generation in the hotel portal.
- **Homepage restructure** (2026-07-12, App.jsx only, generated by conversational Claude and applied manually on top of the front-desk build):
  - Hero is a split layout: "VISIT ERITREA" headline left, `NewsPanel` right — a rotating featured-stories card (auto-advances every 6s; clickable gold progress bars switch manually). Stories come from a static `FEATURED_STORIES` array marked **TEMPORARY** in App.jsx — see Known debt.
  - The search card no longer floats half-overlapping the hero (`translate-y-1/2` removed). It lives in its own framed section directly below: `id="book-search"`, "Book a Stay · Find a hotel, pay in USD" heading, `PLASTER_DIM` background with an ink bottom border. The nav's "Book a Stay" button smooth-scrolls to this id.
  - Explore-rail top padding reduced (`pt-40 sm:pt-44` → `pt-14 sm:pt-16`) since nothing overlaps into it anymore.
  - Story routing: the live Asmara story calls `onExploreAsmara` (content page); non-live stories call `onComingSoon(label)`.
  - The old `App-first.jsx` / `App-version2.jsx` prototypes were deleted; `App-backup.jsx` holds the prior design (not imported). During integration, a stale conversational-Claude copy of App.jsx briefly overwrote the front-desk build on `main` and had to be reverted from backup (`7b2530d` → `bf0d7bb` → `dacd650`) — see workflow rule 5.

Known debt / TODO:
- **Tighten invoice + booking-update RLS.** Migration `009` ships MVP-open policies (`using (true)`) on `invoices` select/insert and `bookings` update. Must become per-partner authenticated access when hotel auth is added.
- **Replace the static `FEATURED_STORIES` array** in App.jsx with a fetch of the latest published `content_pages` rows (migration `005`) once the content system is built, so editors control homepage stories with zero deployments. The array is explicitly marked TEMPORARY in the code.
- **Regenerate and commit migration `004`** (the guests SELECT fix) from the live Supabase schema so `db/migrations/` is a complete history. (002 and 003 were already recovered and committed 2026-07-12.)
- Real restaurant partners to replace the 10 seed listings (then drop `noindex` — data change, not deploy).

Next vertical candidates: tours, car rentals, POIs — same `listings.listing_type` + `site_config` pattern the restaurants vertical established.
