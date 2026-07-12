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

function mapBooking(b, guest) {
  const g = guest || b.guests;
  return {
    id: b.id,
    reference: b.reference_code,
    roomId: b.listing_id,
    guestName: g?.name,
    guestEmail: g?.email,
    checkIn: b.start_date,
    checkOut: b.end_date,
    totalPaid: b.total_amount,
    status: b.status,
    source: b.source || "platform",
    paymentMethod: b.payment_method,
    checkedInAt: b.checked_in_at,
    checkedOutAt: b.checked_out_at,
    notes: b.notes,
    createdAt: b.created_at,
  };
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
  return data.map((b) => mapBooking(b));
}

function genReference() {
  return "EA" + Math.random().toString(36).slice(2, 9).toUpperCase();
}

// guests.email is NOT NULL UNIQUE (001), so walk-ins without an email get a
// synthesized per-booking placeholder rather than colliding on a shared blank.
async function getOrCreateGuest(guestName, guestEmail) {
  const email =
    guestEmail?.trim() ||
    `no-email+${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@frontdesk.eritreantourism.com`;

  const { data: existingGuest } = await supabase
    .from("guests")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingGuest) return { id: existingGuest.id, email };

  const { data: newGuest, error: guestError } = await supabase
    .from("guests")
    .insert({ name: guestName, email })
    .select("id")
    .single();
  if (guestError) throw guestError;
  return { id: newGuest.id, email };
}

async function insertBooking(fields, { guestName, guestEmail }) {
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({ ...fields, reference_code: genReference() })
    .select()
    .single();
  if (error) throw error;
  return mapBooking(booking, { name: guestName, email: guestEmail });
}

// Creates (or reuses) a guest by email, then inserts the booking.
// Note: this does not yet create a real Stripe payment — total_amount is
// recorded on the booking, and a `payments` row can be added once Stripe is wired in.
export async function createBooking({ roomId, guestName, guestEmail, checkIn, checkOut, totalPaid }) {
  const guest = await getOrCreateGuest(guestName, guestEmail);
  return insertBooking(
    {
      listing_id: roomId,
      guest_id: guest.id,
      start_date: checkIn,
      end_date: checkOut,
      quantity: 1,
      status: "confirmed",
      total_amount: totalPaid,
      source: "platform",
      payment_method: "online",
    },
    { guestName, guestEmail: guest.email }
  );
}

// Front-desk booking recorded by the hotel itself (walk-in / phone / email).
// Same bookings table so availability stays a single source of truth; these
// carry no platform payment — payment_method records how the hotel is paid.
export async function createFrontDeskBooking({
  roomId, guestName, guestEmail, checkIn, checkOut, totalAmount, source, paymentMethod, notes,
}) {
  const guest = await getOrCreateGuest(guestName, guestEmail);
  return insertBooking(
    {
      listing_id: roomId,
      guest_id: guest.id,
      start_date: checkIn,
      end_date: checkOut,
      quantity: 1,
      status: "confirmed",
      total_amount: totalAmount,
      source,
      payment_method: paymentMethod,
      notes: notes?.trim() || null,
    },
    { guestName, guestEmail: guest.email }
  );
}

export async function checkInBooking(bookingId) {
  const { error } = await supabase
    .from("bookings")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", bookingId);
  if (error) throw error;
}

export async function checkOutBooking(bookingId) {
  const { error } = await supabase
    .from("bookings")
    .update({ checked_out_at: new Date().toISOString(), status: "completed" })
    .eq("id", bookingId);
  if (error) throw error;
}

/* ------------------------------------------------------------------
   INVOICES (009) — generated per booking, numbered per partner.
------------------------------------------------------------------- */

function mapInvoice(inv) {
  return {
    id: inv.id,
    bookingId: inv.booking_id,
    partnerId: inv.partner_id,
    invoiceNumber: inv.invoice_number,
    lineItems: inv.line_items || [],
    subtotalUsd: Number(inv.subtotal_usd),
    taxRate: Number(inv.tax_rate),
    taxUsd: Number(inv.tax_usd),
    totalUsd: Number(inv.total_usd),
    issuedAt: inv.issued_at,
    status: inv.status,
  };
}

// Latest non-void invoice for a booking, or null if none has been generated.
export async function fetchInvoiceForBooking(bookingId) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("booking_id", bookingId)
    .neq("status", "void")
    .order("issued_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapInvoice(data) : null;
}

const round2 = (n) => Math.round(n * 100) / 100;

// lineItems: [{ description, qty, unitPriceUsd }]. Totals are computed here so
// the stored subtotal/tax/total always agree with the stored line items.
// Invoice numbers are per-partner ('AP-2026-0001'); on a duplicate-number race
// (unique 23505) we bump the sequence and retry.
export async function createInvoice({ bookingId, partnerId, prefix, lineItems, taxRate }) {
  const items = lineItems.map((li) => ({
    description: li.description,
    qty: li.qty,
    unit_price_usd: round2(li.unitPriceUsd),
    total_usd: round2(li.qty * li.unitPriceUsd),
  }));
  const subtotal = round2(items.reduce((s, li) => s + li.total_usd, 0));
  const tax = round2(subtotal * (taxRate / 100));

  const { count, error: countError } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId);
  if (countError) throw countError;

  const year = new Date().getFullYear();
  for (let seq = (count || 0) + 1; seq <= (count || 0) + 5; seq++) {
    const invoiceNumber = `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        booking_id: bookingId,
        partner_id: partnerId,
        invoice_number: invoiceNumber,
        line_items: items,
        subtotal_usd: subtotal,
        tax_rate: taxRate,
        tax_usd: tax,
        total_usd: round2(subtotal + tax),
        status: "issued",
      })
      .select()
      .single();
    if (!error) return mapInvoice(data);
    if (error.code !== "23505") throw error;
  }
  throw new Error("Could not allocate a unique invoice number — try again.");
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
