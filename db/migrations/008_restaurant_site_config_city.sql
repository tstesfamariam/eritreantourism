-- 008: Backfill site_config.city for restaurant listings.
-- Migration 006's site_config generator omitted `city` even though every
-- section that renders it (Hero, Story, Footer, EatIndex) and seo.js all
-- expect a flat restaurant.city — matching the prototype's config shape,
-- where city sat alongside tagline/cuisine/menu/etc. on the same object.
--
-- The value itself was captured correctly, just in the wrong place:
-- migration 006 also inserted it into partners.city. api.js's
-- fetchRestaurantBySlug/fetchRestaurants only query `listings` (never join
-- `partners`), by design — site_config is meant to be self-sufficient for
-- public rendering, the same way it already carries phone/address rather
-- than requiring a join back to partners for those. This backfills city
-- into site_config from the already-correct partners.city, rather than
-- teaching api.js to join.
--
-- Guarded by `site_config->>'city' is null` so it's safe to re-run and
-- won't clobber a row a human has since edited by hand.

update listings l
set site_config = site_config || jsonb_build_object('city', p.city)
from partners p
where l.partner_id = p.id
  and l.listing_type = 'restaurant'
  and (l.site_config ->> 'city') is null;
