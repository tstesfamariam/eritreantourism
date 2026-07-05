-- eritreantourism.com — initial schema
-- Generalized across hotel rooms, guided tours, vehicle rentals, and restaurant tables.
-- listing_type + requires_payment are what let one schema serve all verticals.

create extension if not exists "uuid-ossp";

create table partners (
  id uuid primary key default uuid_generate_v4(),
  business_type text not null check (business_type in ('hotel', 'tour_operator', 'car_rental', 'restaurant')),
  name text not null,
  city text not null default 'Asmara',
  address text,
  phone text,
  email text,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  commission_rate numeric(5,2) not null default 10.00,
  settlement_contact_name text,
  settlement_contact_phone text,
  created_at timestamptz not null default now()
);

create table listings (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references partners(id) on delete cascade,
  listing_type text not null check (listing_type in ('room', 'tour', 'vehicle', 'table')),
  name text not null,
  description text,
  price_usd numeric(10,2),           -- null allowed for confirmation-only listings with variable pricing
  capacity int not null default 1,   -- sleeps / seats / passengers / party size
  requires_payment boolean not null default true,
  attributes jsonb not null default '{}',  -- type-specific extras: amenities, duration, transmission, cuisine, etc.
  created_at timestamptz not null default now()
);

create table availability (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  date date not null,
  time_slot time,                    -- null for date-range listings (rooms, vehicles); set for tours/tables
  units_total int not null,
  units_booked int not null default 0,
  unique (listing_id, date, time_slot)
);

create table guests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  phone text,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id),
  guest_id uuid not null references guests(id),
  start_date date not null,
  end_date date,                     -- null for single-date bookings (tours, restaurant tables)
  time_slot time,
  quantity int not null default 1,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  total_amount numeric(10,2),        -- null when requires_payment = false
  reference_code text not null unique,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references bookings(id),
  amount_usd numeric(10,2) not null,
  processor_ref text,                 -- Stripe/PayPal charge id
  status text not null default 'held' check (status in ('held', 'captured', 'refunded', 'failed')),
  settlement_status text not null default 'pending' check (settlement_status in ('pending', 'sent_to_partner', 'paid_to_partner')),
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

-- Future business line: building/hosting a partner's own branded site,
-- with a commission on bookings it drives back into this same engine.
create table web_services (
  id uuid primary key default uuid_generate_v4(),
  partner_id uuid not null references partners(id) on delete cascade,
  domain text,
  template text,
  hosting_status text not null default 'pending' check (hosting_status in ('pending', 'active', 'suspended')),
  monthly_fee_usd numeric(10,2),
  booking_commission_rate numeric(5,2),
  launched_at timestamptz
);

create index idx_listings_partner on listings(partner_id);
create index idx_availability_listing_date on availability(listing_id, date);
create index idx_bookings_listing on bookings(listing_id);
create index idx_bookings_guest on bookings(guest_id);
create index idx_payments_settlement_status on payments(settlement_status);
