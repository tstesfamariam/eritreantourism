/**
 * seo.js — per-restaurant SEO: schema.org JSON-LD, page title, meta description.
 * Consumed by RestaurantPage.jsx (head tags).
 *
 * `restaurant` is `{ id, slug, name, ...site_config }` (see api.js's
 * mapListingToRestaurant) — field names here must match site_config's keys
 * exactly, not the prototype's original JS-object casing. price_range is
 * stored snake_case (matching the DB convention every other jsonb key
 * uses); read restaurant.price_range, not restaurant.priceRange.
 */

export function generateJsonLd(restaurant) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.tagline,
    servesCuisine: restaurant.cuisine,
    priceRange: restaurant.price_range,
    telephone: restaurant.phone,
    foundingDate: String(restaurant.est),
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressCountry: "ER",
    },
    url: `https://eritreantourism.com/eat/${restaurant.slug}`,
    acceptsReservations: "True",
    hasMenu: `https://eritreantourism.com/eat/${restaurant.slug}#menu`,
  };
}

export function buildPageTitle(restaurant) {
  return `${restaurant.name} — ${restaurant.cuisine} in ${restaurant.city} | Eritrean Tourism`;
}

export function buildMetaDescription(restaurant) {
  const base = `${restaurant.tagline} — ${restaurant.cuisine} in ${restaurant.city}, Eritrea.`;
  return base.length <= 155 ? base : `${base.slice(0, 152)}...`;
}
