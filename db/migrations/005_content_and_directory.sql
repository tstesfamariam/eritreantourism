-- 005: Content & directory schema — the non-commerce half of the platform.
-- Parallel to (and deliberately separate from) the partners/listings commerce
-- schema: content pages, civic directory entries, and events have no
-- commission, settlement, or booking relationship, so they get their own
-- tables. Same generalization principle as listings: one table per concept,
-- a type field instead of table proliferation.

-- ------------------------------------------------------------------
-- CONTENT PAGES — Explore guides, practical travel info, travel logs.
-- The Asmara page becomes the first row; Massawa, Keren, visa info,
-- etc. are new rows, not new code.
-- ------------------------------------------------------------------
create table content_pages (
  id uuid primary key default uuid_generate_v4(),
  content_type text not null check (content_type in (
    'city', 'beach', 'mountain', 'historical_site', 'national_park',
    'museum', 'practical_info', 'travel_log', 'itinerary'
  )),
  slug text not null unique,            -- e.g. 'asmara', 'visa-information'
  title text not null,
  subtitle text,                        -- hero tagline
  hero_image text,                      -- image ref/seed until real photos
  body text,                            -- main write-up (markdown or plain text)
  landmarks jsonb not null default '[]',-- [{name, note, distance}] for POI lists
  region text,                          -- e.g. 'Central', 'Northern Red Sea'
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- DIRECTORY ENTRIES — banks, hospitals, pharmacies, embassies, telecom,
-- shopping. Pure listings: no booking, no payments, ever. Kept separate
-- from `partners` because there is no commercial relationship.
-- ------------------------------------------------------------------
create table directory_entries (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in (
    'bank', 'hospital', 'pharmacy', 'embassy', 'telecom', 'shopping', 'other'
  )),
  name text not null,
  city text not null default 'Asmara',
  address text,
  phone text,
  hours text,                           -- free-text opening hours
  notes text,                           -- e.g. 'accepts USD cash', 'English spoken'
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- EVENTS — festivals, races, cultural celebrations, conferences.
-- ------------------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null check (event_type in (
    'festival', 'race', 'cultural', 'conference', 'other'
  )),
  name text not null,
  description text,
  city text,
  venue text,
  start_date date not null,
  end_date date,
  recurring_note text,                  -- e.g. 'Annual, every May 24'
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- RLS — public reads published rows only; writes stay locked down
-- (admin inserts happen via Supabase dashboard or a service role for now;
-- tighten to authenticated admin role when auth is added).
-- ------------------------------------------------------------------
alter table content_pages enable row level security;
alter table directory_entries enable row level security;
alter table events enable row level security;

create policy "public read published content" on content_pages
  for select using (status = 'published');

create policy "public read published directory" on directory_entries
  for select using (status = 'published');

create policy "public read published events" on events
  for select using (status = 'published');

create index idx_content_pages_type_status on content_pages(content_type, status);
create index idx_directory_category on directory_entries(category, status);
create index idx_events_dates on events(start_date, status);

-- ------------------------------------------------------------------
-- Seed: the existing Asmara page moves from hardcoded JSX into data.
-- ------------------------------------------------------------------
insert into content_pages (content_type, slug, title, subtitle, hero_image, body, landmarks, region, status, sort_order)
values (
  'city',
  'asmara',
  'Asmara',
  'Eritrea''s highland capital, a living museum of modernist architecture',
  'asmara-content-hero',
  'Perched at roughly 2,300 meters in the Eritrean highlands, Asmara is best known for one of the world''s best-preserved collections of early modernist and Art Deco architecture, built during the Italian colonial period of the 1930s. UNESCO inscribed the city center as a World Heritage Site in 2017, citing its unusually intact urban fabric.

Beyond the buildings, Asmara moves at an unhurried pace — tree-lined Harnet Avenue fills with strolling crowds in the evenings, and the city''s coffee culture runs deep, with traditional ceremonies still a centerpiece of daily life.',
  '[
    {"name": "Fiat Tagliero Building", "note": "Futurist former gas station with dramatic cantilevered wings"},
    {"name": "Asmara Opera House", "note": "Grand early-1900s theater on Harnet Avenue"},
    {"name": "National Museum of Eritrea", "note": "Archaeology, culture, and natural history collections"},
    {"name": "Asmara''s Great Mosque & Cathedral", "note": "Landmarks reflecting the city''s mixed religious heritage"}
  ]'::jsonb,
  'Central',
  'published',
  1
);
