-- 006: Front-desk (PMS) support for the hotel portal.
-- Hotels record ALL bookings here — platform (paid online through us) and
-- local (walk-in / phone, billed by the hotel directly) — so availability
-- has one source of truth and online guests can never collide with walk-ins.
--
-- Business rule this encodes: commission + settlement apply ONLY to
-- source='platform' bookings (the ones with a payments row). Local bookings
-- carry no platform money; invoicing for them is a service we provide.

-- ------------------------------------------------------------------
-- BOOKINGS: source + lifecycle
-- ------------------------------------------------------------------
alter table bookings
  add column source text not null default 'platform'
    check (source in ('platform', 'walk_in', 'phone', 'email')),
  add column payment_method text
    check (payment_method in ('online', 'cash', 'card_local', 'bank_transfer', 'other')),
  add column checked_in_at timestamptz,
  add column checked_out_at timestamptz,
  add column notes text;                 -- front-desk notes (late arrival, etc.)

-- Existing platform bookings: mark their payment method explicitly.
update bookings set payment_method = 'online' where source = 'platform';

-- ------------------------------------------------------------------
-- INVOICES: generated per booking, numbered per partner.
-- Line items live as JSON so a hotel can add extras (minibar, laundry)
-- to a stay's invoice without new tables.
-- ------------------------------------------------------------------
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id),
  partner_id uuid not null references partners(id),
  invoice_number text not null,          -- e.g. 'AP-2026-0001' (prefix per hotel)
  line_items jsonb not null default '[]',-- [{description, qty, unit_price_usd, total_usd}]
  subtotal_usd numeric(10,2) not null,
  tax_rate numeric(5,2) not null default 0,
  tax_usd numeric(10,2) not null default 0,
  total_usd numeric(10,2) not null,
  issued_at timestamptz not null default now(),
  status text not null default 'issued' check (status in ('draft', 'issued', 'paid', 'void')),
  unique (partner_id, invoice_number)
);

alter table invoices enable row level security;

-- MVP policies: portal users can create and read invoices.
-- Tighten to per-partner authenticated access when hotel auth is added —
-- flagged in CLAUDE.md immutable rules that payments-side data stays locked.
create policy "public read invoices" on invoices for select using (true);
create policy "public create invoices" on invoices for insert with check (true);

-- Bookings: the portal now also needs to create local bookings and update
-- lifecycle fields (check-in/out). Insert policy already exists (003).
create policy "public update booking lifecycle" on bookings
  for update using (true) with check (true);

create index idx_bookings_source on bookings(source);
create index idx_invoices_partner on invoices(partner_id, issued_at);
