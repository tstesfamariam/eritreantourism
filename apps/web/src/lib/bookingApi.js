import { supabase } from "./supabaseClient";

// Maps a Supabase `partners` row (with its nested `listings`) into the shape
// the UI already expects (hotel.rooms[], hotel.amenities, hotel.rating, etc.)
function mapPartnerToHotel(partner) {
  const firstListing = partner.listings?.[0];
  const attrs = firstListing?.attributes || {};
  return {
    id: partner.id,
    name: partner.name,
    city: partner.city,
    area: partner.address,
    address: partner.address,
    tagline: firstListing?.description || "",
    description: firstListing?.description || "",
    rating: attrs.rating ?? 4.0,
    reviews: attrs.reviews ?? 0,
    amenities: attrs.amenities || [],
    images: attrs.images || ["placeholder-1", "placeholder-2"],
    checkInTime: attrs.checkInTime || "2:00 PM",
    checkOutTime: attrs.checkOutTime || "11:00 AM",
    policies: attrs.policies || [],
    landmarks: attrs.landmarks || [],
    rooms: (partner.listings || []).map((l) => ({
      id: l.id,
      name: l.name,
      priceUsd: Number(l.price_usd),
      sleeps: l.capacity,
      totalUnits: l.attributes?.total_units ?? 1,
    })),
  };
}

export async function fetchHotels() {
  const { data, error } = await supabase
    .from("partners")
    .select("*, listings(*)")
    .eq("business_type", "hotel")
    .eq("status", "active");

  if (error) {
    console.error("fetchHotels failed", error);
    return [];
  }
  return data.map(mapPartnerToHotel);
}

// Bookings for a set of room (listing) ids — used to compute live availability
// and to populate the hotel portal's booking list.
export async function fetchBookingsForListings(listingIds) {
  if (!listingIds.length) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(name, email)")
    .in("listing_id", listingIds)
    .neq("status", "cancelled");

  if (error) {
    console.error("fetchBookingsForListings failed", error);
    return [];
  }
  return data.map((b) => ({
    id: b.id,
    reference: b.reference_code,
    roomId: b.listing_id,
    guestName: b.guests?.name,
    guestEmail: b.guests?.email,
    checkIn: b.start_date,
    checkOut: b.end_date,
    totalPaid: b.total_amount,
    status: b.status,
    createdAt: b.created_at,
  }));
}

function genReference() {
  return "EA" + Math.random().toString(36).slice(2, 9).toUpperCase();
}

// Creates (or reuses) a guest by email, then inserts the booking.
// Note: this does not yet create a real Stripe payment — total_amount is
// recorded on the booking, and a `payments` row can be added once Stripe is wired in.
export async function createBooking({ roomId, guestName, guestEmail, checkIn, checkOut, totalPaid }) {
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
      listing_id: roomId,
      guest_id: guestId,
      start_date: checkIn,
      end_date: checkOut,
      quantity: 1,
      status: "confirmed",
      total_amount: totalPaid,
      reference_code: reference,
    })
    .select()
    .single();

  if (bookingError) throw bookingError;

  return {
    id: booking.id,
    reference: booking.reference_code,
    roomId: booking.listing_id,
    guestName,
    guestEmail,
    checkIn: booking.start_date,
    checkOut: booking.end_date,
    totalPaid: booking.total_amount,
    status: booking.status,
    createdAt: booking.created_at,
  };
}

export async function updateListing(listingId, patch) {
  // patch: { totalUnits, priceUsd } -> maps back onto listings row
  const updates = {};
  if (patch.priceUsd !== undefined) updates.price_usd = patch.priceUsd;
  if (patch.totalUnits !== undefined) {
    const { data: current } = await supabase.from("listings").select("attributes").eq("id", listingId).single();
    updates.attributes = { ...(current?.attributes || {}), total_units: patch.totalUnits };
  }
  const { error } = await supabase.from("listings").update(updates).eq("id", listingId);
  if (error) throw error;
}

export async function addListing(partnerId, room) {
  const { data, error } = await supabase
    .from("listings")
    .insert({
      partner_id: partnerId,
      listing_type: "room",
      name: room.name,
      price_usd: room.priceUsd,
      capacity: room.sleeps || 2,
      requires_payment: true,
      attributes: { total_units: room.totalUnits },
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeListing(listingId) {
  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) throw error;
}

export async function addHotelPartner({ name, area, tagline }) {
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .insert({
      business_type: "hotel",
      name,
      city: "Asmara",
      address: area || "Asmara, Eritrea",
      status: "active",
    })
    .select()
    .single();
  if (partnerError) throw partnerError;

  await addListing(partner.id, { name: "Standard Room", priceUsd: 100, sleeps: 2, totalUnits: 10 });

  return partner;
}
