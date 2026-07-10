import { supabase } from "../../lib/supabaseClient";

/**
 * api.js — data access for the restaurants vertical, mirroring the
 * lib/bookingApi.js pattern (UI/sections never import supabase directly).
 * Schema: migration 006_restaurants_vertical.sql (applied). Reservation
 * requests are wired in via sections/Reserve.jsx.
 */

// Maps a `listings` row (site_config jsonb + a few top-level columns) into
// the restaurant config shape RestaurantSite/sections expect — the same
// shape as RESTAURANTS entries in the prototype.
function mapListingToRestaurant(listing) {
  return {
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    ...listing.site_config,
  };
}

export async function fetchRestaurantBySlug(slug) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, name, slug, theme_id, site_config")
    .eq("slug", slug)
    .eq("listing_type", "restaurant")
    .maybeSingle();

  if (error) {
    console.error("fetchRestaurantBySlug failed", error);
    return null;
  }
  if (!data) return null;

  return { restaurant: mapListingToRestaurant(data), themeId: data.theme_id };
}

export async function fetchRestaurants() {
  const { data, error } = await supabase
    .from("listings")
    .select("id, name, slug, theme_id, site_config")
    .eq("listing_type", "restaurant");

  if (error) {
    console.error("fetchRestaurants failed", error);
    return [];
  }
  return data.map((listing) => ({ restaurant: mapListingToRestaurant(listing), themeId: listing.theme_id }));
}

function genReference() {
  return "EA" + Math.random().toString(36).slice(2, 9).toUpperCase();
}

// Reservation requests are confirmation-only (requires_payment = false):
// no payment row, status starts at 'requested' rather than 'confirmed'.
export async function submitReservationRequest({ listingId, guestName, guestEmail, party, date, time }) {
  const { data: existingGuest } = await supabase
    .from("guests")
    .select("id")
    .eq("email", guestEmail)
    .maybeSingle();

  let guestId = existingGuest?.id;
  if (!guestId) {
    const { data: newGuest, error: guestError } = await supabase
      .from("guests")
      .insert({ name: guestName, email: guestEmail })
      .select("id")
      .single();
    if (guestError) throw guestError;
    guestId = newGuest.id;
  }

  const reference = genReference();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      listing_id: listingId,
      guest_id: guestId,
      start_date: date,
      time_slot: time || null,
      quantity: Number(party) || 1,
      status: "requested",
      total_amount: null,
      reference_code: reference,
    })
    .select()
    .single();

  if (bookingError) throw bookingError;

  return {
    id: booking.id,
    reference: booking.reference_code,
    status: booking.status,
    party: booking.quantity,
    date: booking.start_date,
    time: booking.time_slot,
  };
}
