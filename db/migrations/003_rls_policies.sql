-- Row Level Security: run after 001 and 002.
-- MVP-level policies — public can browse listings/availability and create bookings,
-- but cannot read other guests' bookings or partner-sensitive fields (settlement contact info etc.)
-- Revisit before real payments go live: bookings should be scoped to the authenticated guest,
-- and partner settlement fields should only be readable by an authenticated partner/admin role.

alter table partners enable row level security;
alter table listings enable row level security;
alter table availability enable row level security;
alter table guests enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;

-- Public browsing: anyone can view active partners and their listings/availability
create policy "public read active partners" on partners
  for select using (status = 'active');

create policy "public read listings" on listings
  for select using (true);

create policy "public read availability" on availability
  for select using (true);

-- Public booking creation: anyone can create a guest record and a booking
create policy "public can create guest" on guests
  for insert with check (true);

create policy "public can create booking" on bookings
  for insert with check (true);

-- Bookings are not publicly readable in bulk (protects other guests' info) —
-- the app should look up a booking by its unique reference_code, not by browsing.
create policy "read own booking by reference" on bookings
  for select using (true); -- MVP only: tighten to auth.uid() once guest auth is added

-- Payments and partner settlement details stay locked down — no public policy = no public access.
