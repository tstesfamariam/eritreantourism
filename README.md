# eritreantourism.com

Cross-border booking platform for Eritrea: hotels first, expanding to shared
accommodation, guided tours, vehicle rentals, and (confirmation-only)
restaurant reservations — plus a future website-building/hosting business
line for local partners.

## Why one repo, one schema

Every vertical reduces to the same pattern: a **partner** offers a
**listing**, which has **availability** on specific dates (and sometimes
time slots), which guests **book**, which sometimes generates a **payment**
that gets **settled** to the partner locally. `listing_type` and
`requires_payment` are what let one schema flex across hotel rooms, tour
seats, rental vehicles, and restaurant tables — see `db/migrations/001_init_schema.sql`.

## Structure

```
eritreantourism/
├── db/
│   └── migrations/
│       └── 001_init_schema.sql   — partners, listings, availability, guests, bookings, payments, web_services
├── docs/
│   └── hotel-partner-onboarding-form.docx   — field onboarding form for new hotel partners
└── apps/
    └── web/            — guest-facing booking site + hotel/admin portal (Vite + React)
        └── src/App.jsx
```

## Running the web app locally

```bash
cd apps/web
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Current status (MVP)

- [x] Search → results → hotel detail (Overview/Rooms/Location/Policies) → checkout → confirmation
- [x] Hidden partner/admin area (hotel inventory management, new-hotel onboarding)
- [x] Live availability engine (prevents double-booking)
- [ ] Real Stripe payment integration (currently simulated)
- [ ] Backend API + database (schema defined, not yet wired up — app currently
      persists demo data via in-browser storage)
- [ ] Confirmation emails
- [ ] Settlement/reconciliation view for local payout partner
- [ ] Tours, vehicle rentals, restaurant bookings (same schema, new `listing_type` rows)

## Business context

Two hotels used as reference/benchmark for content structure and standard
fields (photos, amenities, policies, nearby landmarks): Asmara Palace Hotel
and Crystal Hotel, both in Asmara. See `docs/` for the partner onboarding
process.
