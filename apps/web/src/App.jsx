import React, { useState, useEffect, useCallback } from "react";
import {
  Search, MapPin, Star, Wifi, Waves, ParkingCircle, Coffee, UtensilsCrossed, Wind,
  ChevronLeft, ChevronRight, CheckCircle2, SlidersHorizontal, LogIn, Hotel, ShieldCheck,
  Plus, Trash2, Building2, CalendarDays, X, ArrowLeft
} from "lucide-react";

/* ------------------------------------------------------------------
   DATA LAYER
------------------------------------------------------------------- */

const STORAGE_KEY = "asmara-booking-state-v2";

const AMENITY_META = {
  wifi: { label: "Free WiFi", Icon: Wifi },
  pool: { label: "Pool", Icon: Waves },
  parking: { label: "Free parking", Icon: ParkingCircle },
  breakfast: { label: "Breakfast included", Icon: Coffee },
  restaurant: { label: "Restaurant", Icon: UtensilsCrossed },
  ac: { label: "Air conditioning", Icon: Wind },
};

const seedHotels = [
  {
    id: "asmara-palace",
    name: "Asmara Palace Hotel",
    city: "Asmara",
    area: "Airport Road, Asmara",
    address: "Airport Road, Asmara, Central Region, Eritrea",
    tagline: "Full-service hotel with pools and conference center",
    description:
      "Near the airport, Hotel Asmara Palace offers a luxurious retreat with a breakfast buffet, two on-site restaurants, spa services, and both indoor and outdoor pools.",
    rating: 4.1,
    reviews: 459,
    amenities: ["wifi", "pool", "parking", "breakfast", "restaurant", "ac"],
    images: ["asmara-palace-1", "asmara-palace-2", "asmara-palace-3"],
    checkInTime: "12:00 PM – 8:00 PM",
    checkOutTime: "12:00 PM",
    policies: [
      "Guests must contact the property in advance of arrival for check-in instructions.",
      "Front desk staff greet guests on arrival.",
      "Pets are not allowed.",
      "Children are welcome; extra bed/crib charges vary by room type.",
      "Government-issued photo ID required at check-in.",
    ],
    landmarks: [
      { name: "Fiat Tagliero Building", distance: "15 min walk" },
      { name: "Synagogue of Asmara", distance: "13 min walk" },
      { name: "National Museum of Eritrea", distance: "16 min walk" },
      { name: "Asmara International Airport", distance: "4 min drive" },
    ],
    rooms: [
      { id: "ap-standard", name: "Standard Double", totalUnits: 40, priceUsd: 140, sleeps: 2 },
      { id: "ap-deluxe", name: "Deluxe Balcony", totalUnits: 25, priceUsd: 176, sleeps: 2 },
      { id: "ap-suite", name: "Executive Suite", totalUnits: 8, priceUsd: 260, sleeps: 3 },
    ],
  },
  {
    id: "crystal-hotel",
    name: "Crystal Hotel",
    city: "Asmara",
    area: "Bihat Street, City Center",
    address: "Bihat Street No. 17, Asmara, Central Region, Eritrea",
    tagline: "Boutique hotel, walking distance to Harnet Avenue",
    description:
      "Crystal Hotel welcomes travelers with attentive service, in-room WiFi, and a cozy on-site restaurant and bar, all within walking distance of central Asmara's main attractions.",
    rating: 3.8,
    reviews: 117,
    amenities: ["wifi", "parking", "restaurant", "ac"],
    images: ["crystal-1", "crystal-2"],
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    policies: [
      "Front desk staff greet guests on arrival at the property.",
      "Airport transfers available on request (surcharge may apply, 48 hrs notice required).",
      "Pets are not allowed.",
      "Government-issued photo ID required at check-in.",
    ],
    landmarks: [
      { name: "Opera House", distance: "3 min walk" },
      { name: "Former Governor's Palace", distance: "5 min walk" },
      { name: "University of Asmara", distance: "14 min walk" },
      { name: "Asmara International Airport", distance: "14 min drive" },
    ],
    rooms: [
      { id: "ch-standard", name: "Standard Room", totalUnits: 20, priceUsd: 99, sleeps: 2 },
      { id: "ch-twin", name: "Twin Room", totalUnits: 10, priceUsd: 110, sleeps: 2 },
    ],
  },
];

const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;
const imgUrl = (seed, w = 800, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

function loadState() {
  return { hotels: seedHotels, bookings: [] };
}

// NOTE: localStorage is a placeholder for local development only.
// This will be replaced with real Supabase reads/writes once the backend is wired in —
// see db/migrations/001_init_schema.sql for the target schema.
async function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("storage set failed", e);
  }
}

async function restore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* no existing key yet */
  }
  return null;
}

/* ------------------------------------------------------------------
   AVAILABILITY ENGINE
------------------------------------------------------------------- */

function dateRange(checkIn, checkOut) {
  const dates = [];
  if (!checkIn || !checkOut) return dates;
  let d = new Date(checkIn);
  const end = new Date(checkOut);
  while (d < end) {
    dates.push(d.toISOString().slice(0, 10));
    d = new Date(d.getTime() + 86400000);
  }
  return dates;
}

function unitsBookedOn(bookings, roomId, date) {
  return bookings.filter(
    (b) => b.roomId === roomId && b.status !== "cancelled" && dateRange(b.checkIn, b.checkOut).includes(date)
  ).length;
}

function minAvailability(room, bookings, checkIn, checkOut) {
  const days = dateRange(checkIn, checkOut);
  if (days.length === 0) return room.totalUnits;
  return Math.min(...days.map((d) => room.totalUnits - unitsBookedOn(bookings, room.id, d)));
}

function hotelFromPrice(hotel, bookings, checkIn, checkOut) {
  const available = hotel.rooms
    .map((r) => ({ room: r, free: minAvailability(r, bookings, checkIn, checkOut) }))
    .filter((x) => x.free > 0);
  if (available.length === 0) return null;
  return Math.min(...available.map((x) => x.room.priceUsd));
}

/* ------------------------------------------------------------------
   DESIGN TOKENS
------------------------------------------------------------------- */

const INK = "#1C2622";
const PLASTER = "#EFE8D8";
const PETROL = "#1B4750";
const OCHRE = "#C4842E";
const SAGE = "#93A98C";
const CARD_BORDER = "#ddd6c4";

function SpeedLines({ className = "" }) {
  return (
    <div className={`flex flex-col gap-[3px] ${className}`} aria-hidden="true">
      <div className="h-[2px] w-10" style={{ background: OCHRE }} />
      <div className="h-[2px] w-7" style={{ background: OCHRE, opacity: 0.6 }} />
      <div className="h-[2px] w-4" style={{ background: OCHRE, opacity: 0.35 }} />
    </div>
  );
}

function Wing() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        background: `linear-gradient(135deg, ${PETROL} 0%, ${PETROL} 55%, ${INK} 100%)`,
        clipPath: "polygon(0 0, 100% 0, 100% 65%, 55% 100%, 0 80%)",
      }}
    />
  );
}

function AmenityChip({ code }) {
  const meta = AMENITY_META[code];
  if (!meta) return null;
  const { label, Icon } = meta;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

const inputCls = "w-full rounded-md border-2 px-3 py-2 text-sm outline-none transition-colors focus:border-current";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: PETROL }}>
        {label}
      </span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------
   SEARCH BAR (shared by hero + sticky results header)
------------------------------------------------------------------- */

function SearchBar({ query, setQuery, checkIn, setCheckIn, checkOut, setCheckOut, onSearch }) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border-2 bg-white p-3 shadow-sm sm:grid-cols-5" style={{ borderColor: CARD_BORDER }}>
      <div className="sm:col-span-2">
        <Field label="Destination">
          <div className="flex items-center gap-2 rounded-md border-2 px-2 py-1.5" style={{ borderColor: PETROL }}>
            <MapPin className="h-4 w-4 shrink-0" style={{ color: PETROL }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City, e.g. Asmara"
              className="w-full text-sm outline-none"
            />
          </div>
        </Field>
      </div>
      <Field label="Check-in">
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} style={{ borderColor: PETROL }} />
      </Field>
      <Field label="Check-out">
        <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} style={{ borderColor: PETROL }} />
      </Field>
      <div className="flex items-end">
        <button
          onClick={onSearch}
          className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold uppercase tracking-wide text-white"
          style={{ background: OCHRE }}
        >
          <Search className="h-4 w-4" /> Search
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   RESULTS LIST + FILTERS
------------------------------------------------------------------- */

function ResultsView({ hotels, bookings, checkIn, checkOut, onOpenHotel, searchBarProps }) {
  const [maxPrice, setMaxPrice] = useState(400);
  const [activeAmenities, setActiveAmenities] = useState([]);
  const [sort, setSort] = useState("price-asc");

  const priced = hotels
    .map((h) => ({ hotel: h, from: hotelFromPrice(h, bookings, checkIn, checkOut) }))
    .filter((x) => x.from !== null);

  const filtered = priced
    .filter((x) => x.from <= maxPrice)
    .filter((x) => activeAmenities.every((a) => x.hotel.amenities.includes(a)))
    .sort((a, b) => (sort === "price-asc" ? a.from - b.from : b.hotel.rating - a.hotel.rating));

  function toggleAmenity(code) {
    setActiveAmenities((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-8">
      <div className="sticky top-0 z-20 -mx-4 px-4 pb-3 pt-3 sm:-mx-8 sm:px-8" style={{ background: PLASTER }}>
        <SearchBar {...searchBarProps} />
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        <aside className="shrink-0 sm:w-52">
          <div className="rounded-xl border-2 bg-white p-4" style={{ borderColor: CARD_BORDER }}>
            <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: PETROL }}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
            </h4>
            <label className="mb-4 block text-xs">
              <span className="mb-1 block text-gray-500">Max price / night: <strong>${maxPrice}</strong></span>
              <input type="range" min={50} max={400} step={10} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" />
            </label>
            <div className="space-y-2">
              {Object.entries(AMENITY_META).map(([code, meta]) => (
                <label key={code} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={activeAmenities.includes(code)} onChange={() => toggleAmenity(code)} />
                  {meta.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">{filtered.length} propert{filtered.length === 1 ? "y" : "ies"} found</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border px-2 py-1 text-xs">
              <option value="price-asc">Price: low to high</option>
              <option value="rating-desc">Rating: high to low</option>
            </select>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-xl border-2 border-dashed p-8 text-center text-sm text-gray-400" style={{ borderColor: CARD_BORDER }}>
              No hotels match these filters for the selected dates. Try widening your price range or clearing an amenity filter.
            </div>
          )}

          <div className="space-y-4">
            {filtered.map(({ hotel, from }) => (
              <button
                key={hotel.id}
                onClick={() => onOpenHotel(hotel.id)}
                className="flex w-full flex-col overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition-shadow hover:shadow-md sm:flex-row"
                style={{ borderColor: CARD_BORDER }}
              >
                <img src={imgUrl(hotel.images[0], 400, 260)} alt={hotel.name} className="h-40 w-full object-cover sm:h-auto sm:w-48" />
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold" style={{ color: INK }}>{hotel.name}</h3>
                      <span className="flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: PETROL }}>
                        <Star className="h-3 w-3 fill-white" /> {hotel.rating}
                      </span>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" /> {hotel.area}</p>
                    <p className="mt-1 text-xs text-gray-500">{hotel.tagline} · {hotel.reviews} reviews</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {hotel.amenities.slice(0, 4).map((a) => <AmenityChip key={a} code={a} />)}
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between border-t pt-2">
                    <span className="text-xs text-gray-400">Free cancellation available</span>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400">from</p>
                      <p className="text-lg font-black" style={{ color: OCHRE }}>${from}<span className="text-xs font-normal text-gray-400">/night</span></p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   HOTEL DETAIL + ROOM SELECTION
------------------------------------------------------------------- */

function HotelDetail({ hotel, bookings, checkIn, checkOut, onBack, onSelectRoom }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState("overview");
  const nights = Math.max(1, dateRange(checkIn, checkOut).length || 1);

  const detailTabs = [
    { id: "overview", label: "Overview" },
    { id: "rooms", label: "Rooms" },
    { id: "location", label: "Location" },
    { id: "policies", label: "Policies" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-8">
      <button onClick={onBack} className="mb-4 flex items-center gap-1 text-sm font-semibold" style={{ color: PETROL }}>
        <ArrowLeft className="h-4 w-4" /> Back to results
      </button>

      <div className="relative overflow-hidden rounded-xl">
        <img src={imgUrl(hotel.images[imgIdx], 900, 420)} alt={hotel.name} className="h-56 w-full object-cover sm:h-72" />
        {hotel.images.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx((i) => (i - 1 + hotel.images.length) % hotel.images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setImgIdx((i) => (i + 1) % hotel.images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {hotel.images.map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.5)" }} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-black" style={{ color: INK }}>{hotel.name}</h2>
          <p className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3.5 w-3.5" /> {hotel.address || hotel.area}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-bold text-white" style={{ background: PETROL }}>
          <Star className="h-3.5 w-3.5 fill-white" /> {hotel.rating}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-400">{hotel.reviews} reviews</p>

      <div className="mt-4 flex gap-1 border-b" style={{ borderColor: CARD_BORDER }}>
        {detailTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-3 py-2 text-sm font-bold uppercase tracking-wide"
            style={{ color: tab === t.id ? OCHRE : "#9a9284" }}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-0 -bottom-[1px] h-[2px]" style={{ background: OCHRE }} />}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-gray-700">{hotel.description || hotel.tagline}</p>
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: PETROL }}>Popular amenities</h4>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((a) => <AmenityChip key={a} code={a} />)}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p className="flex items-center gap-1.5 font-semibold" style={{ color: INK }}><MapPin className="h-4 w-4" style={{ color: PETROL }} /> {hotel.address || hotel.area}</p>
          </div>
        </div>
      )}

      {tab === "rooms" && (
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}>
            Available rooms · {checkIn || "—"} to {checkOut || "—"} ({nights} night{nights > 1 ? "s" : ""})
          </h3>
          <div className="space-y-3">
            {hotel.rooms.map((r) => {
              const free = checkIn && checkOut ? minAvailability(r, bookings, checkIn, checkOut) : r.totalUnits;
              return (
                <div key={r.id} className="flex items-center justify-between rounded-xl border-2 bg-white p-4" style={{ borderColor: CARD_BORDER }}>
                  <div>
                    <p className="font-bold" style={{ color: INK }}>{r.name}</p>
                    <p className="text-xs text-gray-500">Sleeps {r.sleeps} · {free > 0 ? `${free} left` : "Sold out for these dates"}</p>
                    <p className="mt-1 text-sm font-bold" style={{ color: OCHRE }}>${r.priceUsd} <span className="text-xs font-normal text-gray-400">/ night</span></p>
                  </div>
                  <button
                    disabled={free <= 0 || !checkIn || !checkOut}
                    onClick={() => onSelectRoom(r)}
                    className="rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-30"
                    style={{ background: OCHRE }}
                  >
                    Select
                  </button>
                </div>
              );
            })}
          </div>
          {(!checkIn || !checkOut) && (
            <p className="mt-3 text-xs text-gray-400">Pick check-in and check-out dates above to see live availability.</p>
          )}
        </div>
      )}

      {tab === "location" && (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-semibold" style={{ color: INK }}><MapPin className="h-4 w-4" style={{ color: PETROL }} /> {hotel.address || hotel.area}</p>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: PETROL }}>Things to explore nearby</h4>
            <div className="space-y-2">
              {(hotel.landmarks || []).map((l) => (
                <div key={l.name} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-medium" style={{ color: INK }}>{l.name}</span>
                  <span className="text-xs text-gray-500">{l.distance}</span>
                </div>
              ))}
              {(!hotel.landmarks || hotel.landmarks.length === 0) && (
                <p className="text-sm text-gray-400">No nearby attractions listed yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "policies" && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: PETROL }}>Check-in</p>
              <p className="text-sm text-gray-700">{hotel.checkInTime || "—"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: PETROL }}>Check-out</p>
              <p className="text-sm text-gray-700">{hotel.checkOutTime || "—"}</p>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: PETROL }}>House rules &amp; policies</h4>
            <ul className="space-y-1.5">
              {(hotel.policies || []).map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span style={{ color: OCHRE }}>•</span> {p}
                </li>
              ))}
              {(!hotel.policies || hotel.policies.length === 0) && (
                <li className="text-sm text-gray-400">No policies listed yet — pending from property onboarding.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   CHECKOUT (register + pay)
------------------------------------------------------------------- */

function Checkout({ hotel, room, checkIn, checkOut, onBack, onConfirm }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nights = dateRange(checkIn, checkOut).length || 1;
  const total = room.priceUsd * nights;

  function submit(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Fill in your name, email, and a password to create your account.");
      return;
    }
    onConfirm({ guestName: name, guestEmail: email });
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-16 sm:px-0">
      <button onClick={onBack} className="mb-4 flex items-center gap-1 text-sm font-semibold" style={{ color: PETROL }}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="rounded-xl border-2 bg-white p-5" style={{ borderColor: CARD_BORDER }}>
        <h3 className="text-base font-bold" style={{ color: INK }}>{hotel.name}</h3>
        <p className="text-xs text-gray-500">{room.name} · {checkIn} → {checkOut} · {nights} night{nights > 1 ? "s" : ""}</p>
        <p className="mt-2 text-2xl font-black" style={{ color: OCHRE }}>${total} <span className="text-xs font-normal text-gray-400">USD total</span></p>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border-2 bg-white p-5" style={{ borderColor: CARD_BORDER }}>
        <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}>Create your account to book</h4>
        <Field label="Full name">
          <input className={inputCls} style={{ borderColor: PETROL }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </Field>
        <Field label="Email">
          <input type="email" className={inputCls} style={{ borderColor: PETROL }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
        </Field>
        <Field label="Password">
          <input type="password" className={inputCls} style={{ borderColor: PETROL }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        <button type="submit" className="w-full rounded-md py-2.5 text-sm font-bold uppercase tracking-wide text-white" style={{ background: OCHRE }}>
          Pay ${total} & confirm booking
        </button>
        <p className="text-center text-[11px] text-gray-400">Simulated payment for this prototype — no card is charged.</p>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------
   CONFIRMATION
------------------------------------------------------------------- */

function Confirmation({ hotel, room, booking, onDone }) {
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-6 sm:px-0">
      <div className="rounded-xl border-2 p-6 text-center" style={{ borderColor: SAGE, background: "#fff" }}>
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10" style={{ color: PETROL }} />
        <h3 className="text-lg font-bold" style={{ color: INK }}>Booking confirmed</h3>
        <p className="mt-1 text-sm text-gray-600">Reference <span className="font-mono font-semibold">{booking.reference}</span></p>
        <div className="mt-4 space-y-1 text-left text-sm">
          <p><strong>{hotel.name}</strong> — {room.name}</p>
          <p>{booking.checkIn} → {booking.checkOut}</p>
          <p>Guest: {booking.guestName} ({booking.guestEmail})</p>
          <p className="mt-2 text-base font-bold" style={{ color: OCHRE }}>Total paid: ${booking.totalPaid} USD</p>
        </div>
        <p className="mt-4 text-xs text-gray-500">A confirmation email with this voucher has been sent. Show this reference at check-in.</p>
        <button onClick={onDone} className="mt-5 rounded-md px-4 py-2 text-sm font-semibold text-white" style={{ background: PETROL }}>
          Search more hotels
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   PARTNER AREA (hotel portal + admin) — reached only via footer link
------------------------------------------------------------------- */

function PartnerArea({ hotels, bookings, onUpdateRoom, onAddRoom, onRemoveRoom, onAddHotel, onExit }) {
  const [section, setSection] = useState("choose");

  return (
    <div className="min-h-screen" style={{ background: PLASTER }}>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black" style={{ color: INK }}>Partner &amp; admin access</h2>
          <button onClick={onExit} className="flex items-center gap-1 text-sm font-semibold" style={{ color: PETROL }}>
            <X className="h-4 w-4" /> Exit to guest site
          </button>
        </div>

        {section === "choose" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => setSection("hotel")} className="rounded-xl border-2 bg-white p-6 text-left" style={{ borderColor: CARD_BORDER }}>
              <Hotel className="mb-2 h-6 w-6" style={{ color: PETROL }} />
              <p className="font-bold" style={{ color: INK }}>Hotel portal</p>
              <p className="text-xs text-gray-500">Manage room inventory, pricing, and bookings.</p>
            </button>
            <button onClick={() => setSection("admin")} className="rounded-xl border-2 bg-white p-6 text-left" style={{ borderColor: CARD_BORDER }}>
              <ShieldCheck className="mb-2 h-6 w-6" style={{ color: PETROL }} />
              <p className="font-bold" style={{ color: INK }}>Platform admin</p>
              <p className="text-xs text-gray-500">Onboard a new hotel onto the platform.</p>
            </button>
          </div>
        )}

        {section === "hotel" && (
          <HotelPortal
            hotels={hotels}
            bookings={bookings}
            onUpdateRoom={onUpdateRoom}
            onAddRoom={onAddRoom}
            onRemoveRoom={onRemoveRoom}
            onBack={() => setSection("choose")}
          />
        )}
        {section === "admin" && <AdminView hotels={hotels} onAddHotel={onAddHotel} onBack={() => setSection("choose")} />}
      </div>
    </div>
  );
}

function HotelPortal({ hotels, bookings, onUpdateRoom, onAddRoom, onRemoveRoom, onBack }) {
  const [loggedInId, setLoggedInId] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomUnits, setNewRoomUnits] = useState(5);
  const [newRoomPrice, setNewRoomPrice] = useState(100);

  if (!loggedInId) {
    return (
      <div className="mx-auto max-w-sm rounded-xl border-2 bg-white p-6 text-center" style={{ borderColor: CARD_BORDER }}>
        <button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs font-semibold" style={{ color: PETROL }}><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
        <LogIn className="mx-auto mb-2 h-8 w-8" style={{ color: PETROL }} />
        <h3 className="mb-3 text-base font-bold" style={{ color: INK }}>Hotel login (demo)</h3>
        <p className="mb-4 text-xs text-gray-500">Select your property to simulate signing in.</p>
        <div className="space-y-2">
          {hotels.map((h) => (
            <button key={h.id} onClick={() => setLoggedInId(h.id)} className="flex w-full items-center justify-between rounded-md border-2 px-3 py-2 text-sm font-semibold" style={{ borderColor: PETROL, color: PETROL }}>
              {h.name} <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const hotel = hotels.find((h) => h.id === loggedInId);
  const hotelBookings = bookings.filter((b) => b.hotelId === loggedInId).sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold" style={{ color: INK }}>{hotel.name}</h3>
          <p className="text-xs text-gray-500">{hotel.area}</p>
        </div>
        <button onClick={() => setLoggedInId(null)} className="text-xs font-semibold underline" style={{ color: PETROL }}>Switch hotel</button>
      </div>

      <div className="rounded-xl border-2 bg-white p-4" style={{ borderColor: CARD_BORDER }}>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}><Hotel className="h-4 w-4" /> Room inventory</h4>
        <div className="space-y-2">
          {hotel.rooms.map((r) => (
            <div key={r.id} className="grid grid-cols-12 items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm">
              <span className="col-span-4 font-medium">{r.name}</span>
              <div className="col-span-3 flex items-center gap-1">
                <span className="text-xs text-gray-500">Units</span>
                <input type="number" min={0} value={r.totalUnits} onChange={(e) => onUpdateRoom(hotel.id, r.id, { totalUnits: Math.max(0, Number(e.target.value)) })} className="w-16 rounded border px-2 py-1" />
              </div>
              <div className="col-span-3 flex items-center gap-1">
                <span className="text-xs text-gray-500">$/night</span>
                <input type="number" min={0} value={r.priceUsd} onChange={(e) => onUpdateRoom(hotel.id, r.id, { priceUsd: Math.max(0, Number(e.target.value)) })} className="w-20 rounded border px-2 py-1" />
              </div>
              <button onClick={() => onRemoveRoom(hotel.id, r.id)} className="col-span-2 flex items-center justify-end text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-12 gap-2 border-t pt-3">
          <input placeholder="New room type" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} className="col-span-5 rounded border px-2 py-1.5 text-sm" />
          <input type="number" placeholder="Units" value={newRoomUnits} onChange={(e) => setNewRoomUnits(Number(e.target.value))} className="col-span-2 rounded border px-2 py-1.5 text-sm" />
          <input type="number" placeholder="Price" value={newRoomPrice} onChange={(e) => setNewRoomPrice(Number(e.target.value))} className="col-span-2 rounded border px-2 py-1.5 text-sm" />
          <button
            onClick={() => { if (!newRoomName.trim()) return; onAddRoom(hotel.id, { id: uid("room"), name: newRoomName.trim(), totalUnits: newRoomUnits, priceUsd: newRoomPrice, sleeps: 2 }); setNewRoomName(""); }}
            className="col-span-3 flex items-center justify-center gap-1 rounded-md text-xs font-bold uppercase text-white" style={{ background: OCHRE }}
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border-2 bg-white p-4" style={{ borderColor: CARD_BORDER }}>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}><CalendarDays className="h-4 w-4" /> Bookings ({hotelBookings.length})</h4>
        {hotelBookings.length === 0 ? (
          <p className="text-sm text-gray-400">No bookings yet — they'll appear here the moment a guest pays.</p>
        ) : (
          <div className="space-y-2">
            {hotelBookings.map((b) => {
              const r = hotel.rooms.find((x) => x.id === b.roomId);
              return (
                <div key={b.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold">{b.guestName} <span className="font-mono text-xs text-gray-400">#{b.reference}</span></p>
                    <p className="text-xs text-gray-500">{r?.name} · {b.checkIn} → {b.checkOut}</p>
                  </div>
                  <p className="font-bold" style={{ color: OCHRE }}>${b.totalPaid}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminView({ hotels, onAddHotel, onBack }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [tagline, setTagline] = useState("");
  const [added, setAdded] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHotel({
      id: uid("hotel"), name: name.trim(), city: "Asmara", area: area.trim() || "Asmara, Eritrea",
      tagline: tagline.trim() || "Newly onboarded property", rating: 4.0, reviews: 0,
      amenities: ["wifi"], images: ["placeholder-1", "placeholder-2"],
      rooms: [{ id: uid("room"), name: "Standard Room", totalUnits: 10, priceUsd: 100, sleeps: 2 }],
    });
    setName(""); setArea(""); setTagline(""); setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold" style={{ color: PETROL }}><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
      <form onSubmit={submit} className="space-y-3 rounded-xl border-2 bg-white p-5" style={{ borderColor: CARD_BORDER }}>
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}><ShieldCheck className="h-4 w-4" /> Onboard a new hotel</h4>
        <Field label="Hotel name"><input className={inputCls} style={{ borderColor: PETROL }} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunshine Hotel" /></Field>
        <Field label="Area / address"><input className={inputCls} style={{ borderColor: PETROL }} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Street, Asmara" /></Field>
        <Field label="Short description"><input className={inputCls} style={{ borderColor: PETROL }} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Family-run, 12 rooms" /></Field>
        <button type="submit" className="w-full rounded-md py-2.5 text-sm font-bold uppercase tracking-wide text-white" style={{ background: OCHRE }}>Add hotel to platform</button>
        {added && <p className="text-center text-xs font-semibold" style={{ color: PETROL }}>Added — it now appears live in guest search, no code changes.</p>}
      </form>
      <div className="rounded-xl border-2 bg-white p-4" style={{ borderColor: CARD_BORDER }}>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}><Building2 className="h-4 w-4" /> Platform hotels ({hotels.length})</h4>
        <ul className="space-y-1 text-sm">
          {hotels.map((h) => (
            <li key={h.id} className="flex items-center justify-between">
              <span>{h.name}</span>
              <span className="text-xs text-gray-400">{h.rooms.length} room type{h.rooms.length !== 1 ? "s" : ""}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   ROOT APP
------------------------------------------------------------------- */

export default function App() {
  const [state, setState] = useState(null);
  const [view, setView] = useState("search"); // search | results | hotel | checkout | confirmation | partner
  const [query, setQuery] = useState("Asmara");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [openHotelId, setOpenHotelId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);

  useEffect(() => {
    (async () => {
      const restored = await restore();
      setState(restored || loadState());
    })();
  }, []);

  useEffect(() => {
    if (state) persist(state);
  }, [state]);

  const addBooking = useCallback((booking) => setState((s) => ({ ...s, bookings: [...s.bookings, booking] })), []);
  const updateRoom = useCallback((hotelId, roomId, patch) => setState((s) => ({
    ...s, hotels: s.hotels.map((h) => h.id === hotelId ? { ...h, rooms: h.rooms.map((r) => r.id === roomId ? { ...r, ...patch } : r) } : h),
  })), []);
  const addRoom = useCallback((hotelId, room) => setState((s) => ({
    ...s, hotels: s.hotels.map((h) => h.id === hotelId ? { ...h, rooms: [...h.rooms, room] } : h),
  })), []);
  const removeRoom = useCallback((hotelId, roomId) => setState((s) => ({
    ...s, hotels: s.hotels.map((h) => h.id === hotelId ? { ...h, rooms: h.rooms.filter((r) => r.id !== roomId) } : h),
  })), []);
  const addHotel = useCallback((hotel) => setState((s) => ({ ...s, hotels: [...s.hotels, hotel] })), []);

  if (!state) return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Loading…</div>;

  const searchBarProps = { query, setQuery, checkIn, setCheckIn, checkOut, setCheckOut, onSearch: () => setView("results") };

  if (view === "partner") {
    return (
      <PartnerArea
        hotels={state.hotels} bookings={state.bookings}
        onUpdateRoom={updateRoom} onAddRoom={addRoom} onRemoveRoom={removeRoom} onAddHotel={addHotel}
        onExit={() => setView("search")}
      />
    );
  }

  const openHotel = state.hotels.find((h) => h.id === openHotelId);

  return (
    <div className="min-h-screen" style={{ background: PLASTER, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      {(view === "search" || view === "results") && (
        <div className="relative h-44 sm:h-52">
          <Wing />
          <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-5 sm:px-8">
            <SpeedLines className="mb-2" />
            <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Asmara Stay Exchange</h1>
            <p className="text-xs font-medium uppercase tracking-widest text-white/70 sm:text-sm">Find and book hotels in Eritrea, pay in USD</p>
          </div>
        </div>
      )}

      {view === "search" && (
        <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-8" style={{ marginTop: "-2rem" }}>
          <SearchBar {...searchBarProps} />
          <p className="mt-4 text-center text-xs text-gray-400">Search a destination and your dates to see real-time room availability and pricing.</p>
        </div>
      )}

      {view === "results" && (
        <ResultsView
          hotels={state.hotels.filter((h) => query.trim() === "" || h.city.toLowerCase().includes(query.toLowerCase()))}
          bookings={state.bookings}
          checkIn={checkIn}
          checkOut={checkOut}
          onOpenHotel={(id) => { setOpenHotelId(id); setView("hotel"); }}
          searchBarProps={searchBarProps}
        />
      )}

      {view === "hotel" && openHotel && (
        <HotelDetail
          hotel={openHotel}
          bookings={state.bookings}
          checkIn={checkIn}
          checkOut={checkOut}
          onBack={() => setView("results")}
          onSelectRoom={(room) => { setSelectedRoom(room); setView("checkout"); }}
        />
      )}

      {view === "checkout" && openHotel && selectedRoom && (
        <Checkout
          hotel={openHotel} room={selectedRoom} checkIn={checkIn} checkOut={checkOut}
          onBack={() => setView("hotel")}
          onConfirm={({ guestName, guestEmail }) => {
            const nights = dateRange(checkIn, checkOut).length || 1;
            const booking = {
              id: uid("bk"), reference: uid("EA").toUpperCase(), hotelId: openHotel.id, roomId: selectedRoom.id,
              guestName, guestEmail, checkIn, checkOut, totalPaid: selectedRoom.priceUsd * nights,
              status: "confirmed", createdAt: new Date().toISOString(),
            };
            addBooking(booking);
            setLastBooking(booking);
            setView("confirmation");
          }}
        />
      )}

      {view === "confirmation" && openHotel && selectedRoom && lastBooking && (
        <Confirmation hotel={openHotel} room={selectedRoom} booking={lastBooking} onDone={() => setView("search")} />
      )}

      <footer className="border-t px-4 py-4 text-center sm:px-8" style={{ borderColor: CARD_BORDER }}>
        <button onClick={() => setView("partner")} className="text-[11px] text-gray-400 underline">
          Hotel partner or platform admin? Manage your property here
        </button>
      </footer>
    </div>
  );
}
