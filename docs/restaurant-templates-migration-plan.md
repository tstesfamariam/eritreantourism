# Restaurant Template Engine — Integration Plan
Repo: `github.com/tstesfamariam/eritreantourism` · Stack: Vite + React + Tailwind + Supabase + Netlify

Goal: turn `restaurant-template-engine.jsx` (single-file prototype) into the production `/eat/:slug` vertical. One engine, 25 theme presets, restaurants configured via data — never via code.

---

## 1. Target file structure (`apps/web/src`)

```
features/restaurants/
├── themes.js                  # the 25 THEME presets (exported array + getTheme(id))
├── seo.js                     # generateJsonLd(), buildPageTitle(), buildMetaDescription()
├── RestaurantSite.jsx         # the engine: composes sections from config + theme
├── sections/
│   ├── Nav.jsx                # variants: inline | center | split
│   ├── Hero.jsx               # variants: full | split | stacked | banner | frame
│   ├── Signatures.jsx
│   ├── Menu.jsx               # variants: leader | cards | editorial | minimal
│   ├── Story.jsx
│   ├── Gallery.jsx
│   ├── Reserve.jsx            # request-then-confirm (requires_payment = false)
│   ├── Visit.jsx
│   └── Footer.jsx
└── api.js                     # fetchRestaurantBySlug(), submitReservationRequest()

pages/
├── EatIndex.jsx               # /eat — directory listing of restaurants
└── RestaurantPage.jsx         # /eat/:slug — fetch config → <RestaurantSite/>
```

Rules for the decomposition:
- Sections receive `{ restaurant, theme }` props only. No section imports Supabase directly.
- Keep dynamic theming via inline styles / CSS variables (Tailwind can't do runtime hex values without safelisting). Tailwind stays for structural utilities.
- Move the Google Fonts `@import` into `index.html` as `<link rel="preconnect">` + stylesheet links (faster than CSS @import). Load only the ~12 families the presets use, with `display=swap`.

## 2. Database — migration `005_restaurants_vertical.sql`

Restaurants fit the existing generalized schema. No new tables.

```sql
-- Listings already exist; add theme + site config support
alter table listings add column if not exists theme_id text default 'enda-mama';
alter table listings add column if not exists site_config jsonb default '{}'::jsonb;

-- site_config holds the full restaurant config:
-- { tagline, cuisine, est, story[], signatures[], menu[], hours[], gallery[], phone, address, price_range }

-- Seed two restaurants
insert into partners (name, type) values ('Adulis Kitchen', 'restaurant'), ('Marea Massawa', 'restaurant');

insert into listings (partner_id, listing_type, slug, name, requires_payment, theme_id, site_config)
values
  ((select id from partners where name='Adulis Kitchen'), 'restaurant', 'adulis-kitchen', 'Adulis Kitchen', false, 'enda-mama', '{...}'),
  ((select id from partners where name='Marea Massawa'), 'restaurant', 'marea-massawa', 'Marea', false, 'red-sea', '{...}');
```

(Adapt column/table names to `001_init_schema.sql` exactly — Claude Code should read the migration files first. Confirm RLS: public `select` on restaurant listings, `insert` on bookings for anon reservation requests, mirroring the `004_fix_guests_select.sql` pattern.)

## 3. Data flow

- `RestaurantPage.jsx`: `useParams()` → `fetchRestaurantBySlug(slug)` → `select name, theme_id, site_config from listings where slug = $1 and listing_type = 'restaurant'` → render `<RestaurantSite restaurant={...} theme={getTheme(theme_id)} />`. Handle 404 → redirect to `/eat`.
- `Reserve.jsx` → `submitReservationRequest()` → insert into `bookings` with `status = 'requested'`, no payment record (restaurants are confirmation-only). Reuse patterns from `bookingApi.js`.
- Gallery: swap gradient placeholders for Supabase Storage URLs stored in `site_config.gallery[].image_url`, with the gradient as loading/fallback state.

## 4. SEO checklist (per restaurant page)

- `<title>`: `{name} — {cuisine} in {city} | Eritrean Tourism`
- Meta description from tagline + city (≤155 chars)
- JSON-LD `Restaurant` schema in `<head>` (use `seo.js`; add `react-helmet-async` or a small useEffect head manager since Vite SPA has no head API)
- Canonical URL `https://eritreantourism.com/eat/{slug}`
- OpenGraph tags with first gallery image
- Add `/eat/*` slugs to the sitemap generation
- Note: Vite SPA means crawlers get JS-rendered content. Fine for MVP; if rankings matter later, consider prerendering `/eat/*` (e.g. Netlify prerendering or vite-plugin-ssr). Flag, don't build now.

## 5. Rollout order

1. Read `CLAUDE.md`, `001_init_schema.sql`, `bookingApi.js` to match existing conventions
2. Decompose the prototype into the structure above (visual output must match the prototype exactly — verify by comparing themes `enda-mama`, `red-sea`, `blackline`)
3. Write + run migration 005 in the Supabase project (not EDPN)
4. Wire `/eat` index + `/eat/:slug` routes
5. Reservation insert + confirmation UI state
6. SEO head tags + JSON-LD
7. Update `CLAUDE.md` with the new vertical's architecture
8. Deploy preview on Netlify, test mobile at 375px width before merging

## 6. Explicitly out of scope for this pass

- Payments (restaurants are confirmation-only)
- Admin UI for editing site_config (edit via Supabase dashboard for now)
- Image uploads (seed with placeholder gradients)
- Email/SMS notifications to restaurant owners
