-- Seed data: Asmara Palace Hotel + Crystal Hotel, matching the current app mockup.
-- Run this in Supabase SQL Editor after 001_init_schema.sql.

with p1 as (
  insert into partners (business_type, name, city, address, status, commission_rate)
  values ('hotel', 'Asmara Palace Hotel', 'Asmara', 'Airport Road, Asmara, Central Region, Eritrea', 'active', 10.00)
  returning id
),
p2 as (
  insert into partners (business_type, name, city, address, status, commission_rate)
  values ('hotel', 'Crystal Hotel', 'Asmara', 'Bihat Street No. 17, Asmara, Central Region, Eritrea', 'active', 10.00)
  returning id
)
insert into listings (partner_id, listing_type, name, description, price_usd, capacity, requires_payment, attributes)
select id, 'room', 'Standard Double', 'Full-service hotel with pools and conference center', 140.00, 2, true,
  '{"amenities": ["wifi","pool","parking","breakfast","restaurant","ac"], "rating": 4.1, "reviews": 459, "total_units": 40}'::jsonb
from p1
union all
select id, 'room', 'Deluxe Balcony', 'Full-service hotel with pools and conference center', 176.00, 2, true,
  '{"amenities": ["wifi","pool","parking","breakfast","restaurant","ac"], "rating": 4.1, "reviews": 459, "total_units": 25}'::jsonb
from p1
union all
select id, 'room', 'Executive Suite', 'Full-service hotel with pools and conference center', 260.00, 3, true,
  '{"amenities": ["wifi","pool","parking","breakfast","restaurant","ac"], "rating": 4.1, "reviews": 459, "total_units": 8}'::jsonb
from p1
union all
select id, 'room', 'Standard Room', 'Boutique hotel, walking distance to Harnet Avenue', 99.00, 2, true,
  '{"amenities": ["wifi","parking","restaurant","ac"], "rating": 3.8, "reviews": 117, "total_units": 20}'::jsonb
from p2
union all
select id, 'room', 'Twin Room', 'Boutique hotel, walking distance to Harnet Avenue', 110.00, 2, true,
  '{"amenities": ["wifi","parking","restaurant","ac"], "rating": 3.8, "reviews": 117, "total_units": 10}'::jsonb
from p2;
