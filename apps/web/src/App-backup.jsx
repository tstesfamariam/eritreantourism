import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, MapPin, Star, Wifi, Waves, ParkingCircle, Coffee, UtensilsCrossed, Wind,
  ChevronLeft, ChevronRight, CheckCircle2, SlidersHorizontal, LogIn, Hotel, ShieldCheck,
  Plus, Trash2, Building2, CalendarDays, X, ArrowLeft, Car, Compass, Menu, Landmark, Clock,
  FileText, Printer, LogOut, UserPlus, Sunrise, Sunset
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchHotels, fetchBookingsForListings, createBooking,
  updateListing, addListing, removeListing, addHotelPartner,
  createFrontDeskBooking, checkInBooking, checkOutBooking,
  fetchInvoiceForBooking, createInvoice,
} from "./lib/bookingApi";
import {
  INK, GREEN, GREEN_DEEP, PLASTER, PLASTER_DIM, PETROL, PETROL_DEEP,
  OCHRE, OCHRE_DEEP, ROSE, SAGE, CARD_BORDER, FONT_CSS, imgUrl,
} from "./lib/theme";

/* ------------------------------------------------------------------
   DATA LAYER — backed by Supabase (see src/lib/bookingApi.js and
   db/migrations/001_init_schema.sql for the schema behind this).
------------------------------------------------------------------- */

const AMENITY_META = {
  wifi: { label: "Free WiFi", Icon: Wifi },
  pool: { label: "Pool", Icon: Waves },
  parking: { label: "Free parking", Icon: ParkingCircle },
  breakfast: { label: "Breakfast included", Icon: Coffee },
  restaurant: { label: "Restaurant", Icon: UtensilsCrossed },
  ac: { label: "Air conditioning", Icon: Wind },
};

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

/* Tricolor speed lines: futurist motion motif carrying the flag's
   green / red / blue in its top-to-bottom order. */
function SpeedLines({ className = "" }) {
  return (
    <div className={`flex flex-col gap-[4px] ${className}`} aria-hidden="true">
      <div className="h-[3px] w-16" style={{ background: GREEN }} />
      <div className="h-[3px] w-11" style={{ background: ROSE }} />
      <div className="h-[3px] w-6" style={{ background: PETROL }} />
    </div>
  );
}

/* Duotone poster image: grayscale photo + tonal multiply + paper lift */
function Poster({ seed, w, h, className = "", tone = PETROL_DEEP }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={imgUrl(seed, w, h)} alt="" className="duotone poster-img absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 mix-blend-multiply" style={{ background: tone }} />
      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: PLASTER, opacity: 0.35 }} />
    </div>
  );
}

function Hero({ imageSeed = "asmara-hero-1", height = "h-72 sm:h-96", children, tone = GREEN_DEEP }) {
  return (
    <div className={`relative ${height} overflow-hidden`} style={{ background: tone }}>
      <Poster seed={imageSeed} w={1600} h={700} className="absolute inset-0" tone={tone} />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(18,58,43,0.05) 0%, rgba(18,58,43,0.45) 60%, rgba(18,58,43,0.8) 100%)" }}
      />
      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-6 sm:px-8">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------
   SITE MAP — the full category structure. Each leaf item is either
   "live" (routes into working functionality) or "soon" (routes to a
   ComingSoon placeholder). This is the single source of truth for nav —
   update here, both the header quick-links and the side drawer read from it.
------------------------------------------------------------------- */

const SITE_MAP = [
  {
    id: "explore", label: "Explore",
    items: [
      { id: "explore-asmara", label: "Asmara (city)", status: "live", view: "content", param: "asmara" },
      { id: "explore-cities", label: "Other Cities", status: "soon" },
      { id: "explore-beaches", label: "Beaches", status: "soon" },
      { id: "explore-mountains", label: "Mountains", status: "soon" },
      { id: "explore-historical", label: "Historical Sites", status: "soon" },
      { id: "explore-parks", label: "National Parks", status: "soon" },
      { id: "explore-museums", label: "Museums", status: "soon" },
    ],
  },
  {
    id: "stay", label: "Stay",
    items: [
      { id: "stay-hotels", label: "Hotels", status: "live", view: "home" },
      { id: "stay-resorts", label: "Resorts", status: "soon" },
      { id: "stay-guesthouses", label: "Guest Houses", status: "soon" },
      { id: "stay-camping", label: "Camping", status: "soon" },
    ],
  },
  {
    id: "eat", label: "Eat",
    items: [
      { id: "eat-restaurants", label: "Restaurants", status: "live", route: "/eat" },
      { id: "eat-coffee", label: "Coffee Houses", status: "soon" },
      { id: "eat-traditional", label: "Traditional Food", status: "soon" },
    ],
  },
  {
    id: "experience", label: "Experience",
    items: [
      { id: "exp-tours", label: "Tours", status: "soon" },
      { id: "exp-hiking", label: "Hiking", status: "soon" },
      { id: "exp-cycling", label: "Cycling", status: "soon" },
      { id: "exp-diving", label: "Diving", status: "soon" },
      { id: "exp-birds", label: "Bird Watching", status: "soon" },
      { id: "exp-culture", label: "Cultural Experiences", status: "soon" },
    ],
  },
  {
    id: "travel", label: "Travel",
    items: [
      { id: "travel-flights", label: "Flights", status: "soon" },
      { id: "travel-visa", label: "Visa Information", status: "soon" },
      { id: "travel-cars", label: "Car Rental", status: "soon" },
      { id: "travel-bus", label: "Bus Routes", status: "soon" },
      { id: "travel-ferries", label: "Ferries", status: "soon" },
    ],
  },
  {
    id: "events", label: "Events",
    items: [{ id: "events-calendar", label: "Festivals & Events Calendar", status: "soon" }],
  },
  {
    id: "directory", label: "Business Directory",
    items: [
      { id: "dir-banks", label: "Banks", status: "soon" },
      { id: "dir-hospitals", label: "Hospitals", status: "soon" },
      { id: "dir-pharmacies", label: "Pharmacies", status: "soon" },
      { id: "dir-embassies", label: "Embassies", status: "soon" },
      { id: "dir-telecom", label: "Telecom", status: "soon" },
      { id: "dir-shopping", label: "Shopping", status: "soon" },
    ],
  },
  {
    id: "services", label: "Services",
    items: [
      { id: "svc-guides", label: "Tour Guides", status: "soon" },
      { id: "svc-photo", label: "Photographers", status: "soon" },
      { id: "svc-translate", label: "Translators", status: "soon" },
      { id: "svc-taxi", label: "Taxi Services", status: "soon" },
    ],
  },
];

function SideDrawer({ open, onClose, onNavigateItem }) {
  const [expanded, setExpanded] = useState("explore");

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-xs overflow-y-auto bg-white shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: CARD_BORDER }}>
          <span className="text-sm font-black uppercase tracking-tight" style={{ color: PETROL }}>
            eritreantourism<span style={{ color: OCHRE }}>.com</span>
          </span>
          <button onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" style={{ color: PETROL }} /></button>
        </div>
        <nav className="px-2 py-3">
          {SITE_MAP.map((section) => (
            <div key={section.id} className="border-b" style={{ borderColor: "#f0ece0" }}>
              <button
                onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                className="flex w-full items-center justify-between px-3 py-3 text-sm font-bold uppercase tracking-wide"
                style={{ color: INK }}
              >
                {section.label}
                <ChevronRight className={`h-4 w-4 transition-transform ${expanded === section.id ? "rotate-90" : ""}`} style={{ color: OCHRE }} />
              </button>
              {expanded === section.id && (
                <div className="pb-2 pl-3">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigateItem(item)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm"
                      style={{ color: item.status === "live" ? PETROL : "#a39c8c" }}
                    >
                      <span className={item.status === "live" ? "font-semibold" : ""}>{item.label}</span>
                      {item.status === "soon" && (
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-400">Soon</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}

function NavHeader({ onOpenMenu, onNavigate, onNavigateItem, onBookStay }) {
  const [openId, setOpenId] = useState(null);
  const closeTimer = useRef(null);

  function openNow(id) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenId(id);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpenId(null), 150);
  }

  return (
    <header className="sticky top-0 z-30" style={{ background: PLASTER, borderBottom: `1px solid ${CARD_BORDER}` }}>
      {/* utility strip */}
      <div className="font-utility hidden items-center justify-between px-6 py-1.5 text-[10px] uppercase tracking-[0.2em] sm:flex" style={{ background: INK, color: PLASTER_DIM }}>
        <span>Asmara · 15.34°N 38.93°E · alt. 2,325 m</span>
        <span>Nakfa (ERN) · hotels priced in USD</span>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onOpenMenu} aria-label="Open menu" className="rounded-md p-1 hover:bg-black/5 lg:hidden">
            <Menu className="h-5 w-5" style={{ color: PETROL }} />
          </button>
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5">
            <SpeedLines className="hidden scale-75 sm:flex" />
            <span className="font-display text-xl uppercase tracking-wide" style={{ color: INK, fontWeight: 800 }}>
              Eritrean<span style={{ color: OCHRE_DEEP }}>Tourism</span>
            </span>
          </button>
        </div>
        <nav className="hidden items-center lg:flex">
          {SITE_MAP.map((section) => (
            <div key={section.id} className="relative" onMouseEnter={() => openNow(section.id)} onMouseLeave={closeSoon}>
              <button
                onClick={() => setOpenId(openId === section.id ? null : section.id)}
                className="font-body flex items-center gap-1 px-2.5 py-2 text-[12px] font-semibold uppercase tracking-wider xl:text-[13px]"
                style={{ color: openId === section.id ? OCHRE_DEEP : INK }}
              >
                {section.label}
                <ChevronRight className={`h-3 w-3 transition-transform ${openId === section.id ? "-rotate-90" : "rotate-90"}`} />
              </button>
              {openId === section.id && (
                <div className="absolute left-0 top-full z-40 w-56 border shadow-lg" style={{ background: PLASTER, borderColor: CARD_BORDER }}>
                  <div className="h-[3px]" style={{ background: OCHRE }} />
                  {section.items.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => { setOpenId(null); onNavigateItem(item); }}
                      className="font-body flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-all hover:pl-5"
                      style={{ color: item.status === "live" ? INK : "#a39c8c", borderTop: i ? `1px solid ${CARD_BORDER}` : "none" }}
                    >
                      <span className={item.status === "live" ? "font-semibold" : ""}>{item.label}</span>
                      {item.status === "soon" && (
                        <span className="font-utility text-[9px] uppercase tracking-widest" style={{ color: ROSE }}>soon</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={onBookStay} className="font-body ml-3 px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-white" style={{ background: ROSE }}>
            Book a stay
          </button>
        </nav>
      </div>
    </header>
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
          className="font-body flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-transform active:translate-y-[1px]"
          style={{ background: ROSE }}
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
      <div className="sticky top-[57px] z-20 -mx-4 px-4 pb-3 pt-3 sm:-mx-8 sm:px-8" style={{ background: PLASTER }}>
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

function HotelDetail({ hotel, bookings, checkIn, checkOut, setCheckIn, setCheckOut, onBack, onSelectRoom }) {
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

          {/* Inline date selection — guests often land here from the homepage
              cards without dates, so let them pick right where they book. */}
          <div
            className="mb-4 rounded-xl border-2 bg-white p-4"
            style={{ borderColor: !checkIn || !checkOut ? OCHRE : CARD_BORDER }}
          >
            {(!checkIn || !checkOut) && (
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: OCHRE_DEEP }}>
                Select your dates to book
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Check-in">
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} style={{ borderColor: PETROL }} />
              </Field>
              <Field label="Check-out">
                <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} style={{ borderColor: PETROL }} />
              </Field>
            </div>
          </div>

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
                    style={{ background: ROSE }}
                  >
                    Select
                  </button>
                </div>
              );
            })}
          </div>
          {(!checkIn || !checkOut) && (
            <p className="mt-3 text-xs text-gray-400">Room selection unlocks once you've chosen check-in and check-out dates above.</p>
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

function PartnerArea({ hotels, bookings, onUpdateRoom, onAddRoom, onRemoveRoom, onAddHotel, onCreateFrontDeskBooking, onCheckIn, onCheckOut, onExit }) {
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
            onCreateFrontDeskBooking={onCreateFrontDeskBooking}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
            onBack={() => setSection("choose")}
          />
        )}
        {section === "admin" && <AdminView hotels={hotels} onAddHotel={onAddHotel} onBack={() => setSection("choose")} />}
      </div>
    </div>
  );
}

/* ---- Front-desk helpers (walk-in/phone bookings, check-in/out, invoices) ---- */

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const SOURCE_META = {
  platform: { label: "Online", bg: PETROL },
  walk_in: { label: "Walk-in", bg: OCHRE_DEEP },
  phone: { label: "Phone", bg: GREEN },
  email: { label: "Email", bg: INK },
};

const PAYMENT_LABELS = {
  online: "Paid online",
  cash: "Cash",
  card_local: "Card (local)",
  bank_transfer: "Bank transfer",
  other: "Other",
};

// Guests without an email get a synthesized placeholder (see bookingApi) — never show it.
function displayEmail(email) {
  return email && !email.startsWith("no-email+") ? email : null;
}

function SourceBadge({ source }) {
  const meta = SOURCE_META[source] || SOURCE_META.platform;
  return (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: meta.bg }}>
      {meta.label}
    </span>
  );
}

function StayStateChip({ booking }) {
  if (booking.checkedOutAt)
    return <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">Checked out</span>;
  if (booking.checkedInAt)
    return <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: SAGE, color: INK }}>In-house</span>;
  return null;
}

function LifecycleButtons({ booking, busyId, onCheckIn, onCheckOut }) {
  const busy = busyId === booking.id;
  if (booking.checkedOutAt) return null;
  if (booking.checkedInAt) {
    return (
      <button disabled={busy} onClick={() => onCheckOut(booking.id)} className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase text-white disabled:opacity-50" style={{ background: PETROL }}>
        <LogOut className="h-3 w-3" /> Check out
      </button>
    );
  }
  return (
    <button disabled={busy} onClick={() => onCheckIn(booking.id)} className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase text-white disabled:opacity-50" style={{ background: GREEN }}>
      <LogIn className="h-3 w-3" /> Check in
    </button>
  );
}

function FrontDeskToday({ hotel, bookings, busyId, onCheckIn, onCheckOut }) {
  const today = todayLocal();
  const roomName = (id) => hotel.rooms.find((r) => r.id === id)?.name || "Room";
  const arrivals = bookings.filter((b) => b.checkIn === today && !b.checkedInAt && !b.checkedOutAt);
  const departures = bookings.filter((b) => b.checkOut === today && !b.checkedOutAt);

  const row = (b) => (
    <div key={b.id} className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-1.5 font-semibold">{b.guestName} <SourceBadge source={b.source} /></p>
        <p className="text-xs text-gray-500">{roomName(b.roomId)} · <span className="font-mono">#{b.reference}</span></p>
      </div>
      <LifecycleButtons booking={b} busyId={busyId} onCheckIn={onCheckIn} onCheckOut={onCheckOut} />
    </div>
  );

  return (
    <div className="rounded-xl border-2 bg-white p-4" style={{ borderColor: CARD_BORDER }}>
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}>
        <Clock className="h-4 w-4" /> Front desk today · {today}
      </h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: GREEN }}>
            <Sunrise className="h-3.5 w-3.5" /> Arrivals ({arrivals.length})
          </p>
          {arrivals.length === 0 ? <p className="text-xs text-gray-400">No arrivals due today.</p> : <div className="space-y-2">{arrivals.map(row)}</div>}
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: OCHRE_DEEP }}>
            <Sunset className="h-3.5 w-3.5" /> Departures ({departures.length})
          </p>
          {departures.length === 0 ? <p className="text-xs text-gray-400">No departures due today.</p> : <div className="space-y-2">{departures.map(row)}</div>}
        </div>
      </div>
    </div>
  );
}

function NewBookingForm({ hotel, onCreate }) {
  const [roomId, setRoomId] = useState(hotel.rooms[0]?.id || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState(todayLocal());
  const [checkOut, setCheckOut] = useState("");
  const [source, setSource] = useState("walk_in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [totalOverride, setTotalOverride] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedRef, setSavedRef] = useState("");

  const room = hotel.rooms.find((r) => r.id === roomId);
  const nights = dateRange(checkIn, checkOut).length;
  const suggested = room && nights > 0 ? room.priceUsd * nights : 0;
  const total = totalOverride !== "" ? Number(totalOverride) : suggested;

  async function submit(e) {
    e.preventDefault();
    setError(""); setSavedRef("");
    if (!room || !name.trim()) { setError("Guest name and room are required."); return; }
    if (nights <= 0) { setError("Check-out must be after check-in."); return; }
    setSaving(true);
    try {
      const saved = await onCreate({
        roomId, guestName: name.trim(), guestEmail: email, checkIn, checkOut,
        totalAmount: total, source, paymentMethod, notes,
      });
      setSavedRef(saved.reference);
      setName(""); setEmail(""); setNotes(""); setTotalOverride(""); setCheckOut("");
    } catch (err) {
      console.error("front-desk booking failed", err);
      setError(`${err.message || "Could not save the booking."}${err.code ? ` (${err.code})` : ""}`);
    } finally {
      setSaving(false);
    }
  }

  const selectCls = "w-full rounded-md border-2 bg-white px-3 py-2 text-sm outline-none";

  return (
    <form onSubmit={submit} className="rounded-xl border-2 bg-white p-4" style={{ borderColor: CARD_BORDER }}>
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}>
        <UserPlus className="h-4 w-4" /> New booking (walk-in / phone)
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Guest name">
          <input className={inputCls} style={{ borderColor: PETROL }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Guest full name" />
        </Field>
        <Field label="Email (optional)">
          <input type="email" className={inputCls} style={{ borderColor: PETROL }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="guest@email.com" />
        </Field>
        <Field label="Room">
          <select className={selectCls} style={{ borderColor: PETROL }} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {hotel.rooms.map((r) => <option key={r.id} value={r.id}>{r.name} — ${r.priceUsd}/night</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Check-in">
            <input type="date" className={inputCls} style={{ borderColor: PETROL }} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </Field>
          <Field label="Check-out">
            <input type="date" min={checkIn} className={inputCls} style={{ borderColor: PETROL }} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </Field>
        </div>
        <Field label="Source">
          <select className={selectCls} style={{ borderColor: PETROL }} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="walk_in">Walk-in</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
          </select>
        </Field>
        <Field label="Payment method">
          <select className={selectCls} style={{ borderColor: PETROL }} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="card_local">Card (local)</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label={`Total USD${nights > 0 ? ` (${nights} night${nights > 1 ? "s" : ""} suggested $${suggested})` : ""}`}>
          <input type="number" min={0} step="0.01" className={inputCls} style={{ borderColor: PETROL }} value={totalOverride} onChange={(e) => setTotalOverride(e.target.value)} placeholder={suggested ? `$${suggested}` : "0"} />
        </Field>
        <Field label="Notes (optional)">
          <input className={inputCls} style={{ borderColor: PETROL }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Late arrival, airport pickup…" />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
      {savedRef && <p className="mt-3 text-sm font-semibold" style={{ color: GREEN }}>Booking saved — reference <span className="font-mono">#{savedRef}</span></p>}
      <button type="submit" disabled={saving} className="mt-4 w-full rounded-md py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50" style={{ background: OCHRE }}>
        {saving ? "Saving…" : `Record booking${total > 0 ? ` — $${total}` : ""}`}
      </button>
    </form>
  );
}

/* ---- Invoices ---- */

function invoicePrefix(hotelName) {
  const initials = hotelName.split(/\s+/).map((w) => w[0]).join("").toUpperCase().replace(/[^A-Z]/g, "");
  return initials.slice(0, 3) || "INV";
}

function InvoiceModal({ hotel, booking, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchInvoiceForBooking(booking.id)
      .then((inv) => { if (!cancelled) { setInvoice(inv); setLoading(false); } })
      .catch((err) => {
        console.error("fetchInvoiceForBooking failed", err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [booking.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div className="rounded-xl bg-white px-8 py-6 text-sm text-gray-400">Loading invoice…</div>
      </div>
    );
  }
  if (invoice) return <InvoicePrintView hotel={hotel} booking={booking} invoice={invoice} onClose={onClose} />;
  return <InvoiceBuilder hotel={hotel} booking={booking} onGenerated={setInvoice} onClose={onClose} />;
}

function InvoiceBuilder({ hotel, booking, onGenerated, onClose }) {
  const room = hotel.rooms.find((r) => r.id === booking.roomId);
  const nights = dateRange(booking.checkIn, booking.checkOut).length || 1;
  const nightly = booking.totalPaid ? Math.round((booking.totalPaid / nights) * 100) / 100 : room?.priceUsd || 0;
  const [lines, setLines] = useState([
    { description: `${room?.name || "Room"} · ${nights} night${nights > 1 ? "s" : ""}`, qty: nights, unitPriceUsd: nightly },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subtotal = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPriceUsd) || 0), 0);
  const tax = subtotal * ((Number(taxRate) || 0) / 100);

  function setLine(i, patch) { setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l))); }

  async function generate() {
    setError("");
    const items = lines
      .filter((l) => l.description.trim())
      .map((l) => ({ description: l.description.trim(), qty: Number(l.qty) || 1, unitPriceUsd: Number(l.unitPriceUsd) || 0 }));
    if (!items.length) { setError("Add at least one line item."); return; }
    setSaving(true);
    try {
      const inv = await createInvoice({
        bookingId: booking.id, partnerId: hotel.id, prefix: invoicePrefix(hotel.name),
        lineItems: items, taxRate: Number(taxRate) || 0,
      });
      onGenerated(inv);
    } catch (err) {
      console.error("createInvoice failed", err);
      setError(`${err.message || "Could not create the invoice."}${err.code ? ` (${err.code})` : ""}`);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}>
            <FileText className="h-4 w-4" /> Generate invoice
          </h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>
        <p className="mb-4 text-xs text-gray-500">
          {booking.guestName} · <span className="font-mono">#{booking.reference}</span> · {booking.checkIn} → {booking.checkOut}
        </p>

        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2">
              <input className="col-span-6 rounded border px-2 py-1.5 text-sm" placeholder="Description" value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} />
              <input type="number" min={1} className="col-span-2 rounded border px-2 py-1.5 text-sm" placeholder="Qty" value={l.qty} onChange={(e) => setLine(i, { qty: e.target.value })} />
              <input type="number" min={0} step="0.01" className="col-span-3 rounded border px-2 py-1.5 text-sm" placeholder="Unit $" value={l.unitPriceUsd} onChange={(e) => setLine(i, { unitPriceUsd: e.target.value })} />
              <button onClick={() => setLines(lines.filter((_, j) => j !== i))} disabled={lines.length === 1} className="col-span-1 flex justify-end text-gray-400 hover:text-red-600 disabled:opacity-30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setLines([...lines, { description: "", qty: 1, unitPriceUsd: 0 }])} className="mt-2 flex items-center gap-1 text-xs font-semibold" style={{ color: PETROL }}>
          <Plus className="h-3.5 w-3.5" /> Add line item (minibar, laundry…)
        </button>

        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: PETROL }}>
            Tax rate %
            <input type="number" min={0} max={100} step="0.01" className="w-20 rounded border px-2 py-1 text-sm font-normal normal-case" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </label>
          <div className="text-right text-xs text-gray-500">
            <p>Subtotal ${subtotal.toFixed(2)} · Tax ${tax.toFixed(2)}</p>
            <p className="text-base font-bold" style={{ color: OCHRE }}>Total ${(subtotal + tax).toFixed(2)}</p>
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
        <button onClick={generate} disabled={saving} className="mt-4 w-full rounded-md py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50" style={{ background: OCHRE }}>
          {saving ? "Generating…" : "Generate invoice"}
        </button>
      </div>
    </div>
  );
}

function InvoicePrintView({ hotel, booking, invoice, onClose }) {
  const guestEmail = displayEmail(booking.guestEmail);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <style>{`@media print {
        body * { visibility: hidden; }
        .invoice-print-area, .invoice-print-area * { visibility: visible; }
        .invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; border-radius: 0; }
        .no-print { display: none !important; }
      }`}</style>
      <div className="invoice-print-area mx-auto max-w-2xl rounded-xl bg-white p-8">
        <div className="no-print mb-5 flex justify-end gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white" style={{ background: PETROL }}>
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button onClick={onClose} className="flex items-center gap-1 rounded-md border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide" style={{ borderColor: CARD_BORDER, color: INK }}>
            <X className="h-3.5 w-3.5" /> Close
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 border-b-2 pb-5" style={{ borderColor: INK }}>
          <div>
            <p className="text-xl font-black uppercase" style={{ color: INK }}>{hotel.name}</p>
            <p className="text-xs text-gray-500">{hotel.address || hotel.area}</p>
            <p className="text-xs text-gray-500">{hotel.city}, Eritrea</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black uppercase tracking-wide" style={{ color: PETROL }}>Invoice</p>
            <p className="font-mono text-sm font-semibold">{invoice.invoiceNumber}</p>
            <p className="text-xs text-gray-500">Issued {new Date(invoice.issuedAt).toLocaleDateString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{invoice.status}</p>
          </div>
        </div>

        <div className="grid gap-4 py-5 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Billed to</p>
            <p className="font-semibold">{booking.guestName}</p>
            {guestEmail && <p className="text-xs text-gray-500">{guestEmail}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stay</p>
            <p>{booking.checkIn} → {booking.checkOut}</p>
            <p className="text-xs text-gray-500">
              Booking <span className="font-mono">#{booking.reference}</span>
              {booking.paymentMethod ? ` · ${PAYMENT_LABELS[booking.paymentMethod] || booking.paymentMethod}` : ""}
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2">{li.description}</td>
                <td className="py-2 text-right">{li.qty}</td>
                <td className="py-2 text-right">${Number(li.unit_price_usd).toFixed(2)}</td>
                <td className="py-2 text-right font-semibold">${Number(li.total_usd).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-full max-w-[220px] space-y-1 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${invoice.subtotalUsd.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Tax ({invoice.taxRate}%)</span><span>${invoice.taxUsd.toFixed(2)}</span></div>
          <div className="flex justify-between border-t-2 pt-1 text-base font-black" style={{ borderColor: INK, color: INK }}>
            <span>Total USD</span><span>${invoice.totalUsd.toFixed(2)}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-gray-400">
          Generated by eritreantourism.com · front-desk services for {hotel.name}
        </p>
      </div>
    </div>
  );
}

function HotelPortal({ hotels, bookings, onUpdateRoom, onAddRoom, onRemoveRoom, onCreateFrontDeskBooking, onCheckIn, onCheckOut, onBack }) {
  const [loggedInId, setLoggedInId] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomUnits, setNewRoomUnits] = useState(5);
  const [newRoomPrice, setNewRoomPrice] = useState(100);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [busyBookingId, setBusyBookingId] = useState(null);
  const [lifecycleError, setLifecycleError] = useState("");

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
  const roomIds = new Set(hotel.rooms.map((r) => r.id));
  const hotelBookings = bookings.filter((b) => roomIds.has(b.roomId)).sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

  async function runLifecycle(bookingId, fn) {
    setBusyBookingId(bookingId);
    setLifecycleError("");
    try {
      await fn(bookingId);
    } catch (err) {
      console.error("booking lifecycle update failed", err);
      setLifecycleError(`${err.message || "Update failed."}${err.code ? ` (${err.code})` : ""}`);
    } finally {
      setBusyBookingId(null);
    }
  }
  const handleCheckIn = (id) => runLifecycle(id, onCheckIn);
  const handleCheckOut = (id) => runLifecycle(id, onCheckOut);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold" style={{ color: INK }}>{hotel.name}</h3>
          <p className="text-xs text-gray-500">{hotel.area}</p>
        </div>
        <button onClick={() => setLoggedInId(null)} className="text-xs font-semibold underline" style={{ color: PETROL }}>Switch hotel</button>
      </div>

      {lifecycleError && <p className="text-sm font-medium text-red-700">{lifecycleError}</p>}

      <FrontDeskToday hotel={hotel} bookings={hotelBookings} busyId={busyBookingId} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />

      <NewBookingForm hotel={hotel} onCreate={onCreateFrontDeskBooking} />

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
            onClick={() => { if (!newRoomName.trim()) return; onAddRoom(hotel.id, { name: newRoomName.trim(), totalUnits: newRoomUnits, priceUsd: newRoomPrice, sleeps: 2 }); setNewRoomName(""); }}
            className="col-span-3 flex items-center justify-center gap-1 rounded-md text-xs font-bold uppercase text-white" style={{ background: OCHRE }}
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border-2 bg-white p-4" style={{ borderColor: CARD_BORDER }}>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide" style={{ color: PETROL }}><CalendarDays className="h-4 w-4" /> Bookings ({hotelBookings.length})</h4>
        {hotelBookings.length === 0 ? (
          <p className="text-sm text-gray-400">No bookings yet — they'll appear here the moment a guest pays or the front desk records one.</p>
        ) : (
          <div className="space-y-2">
            {hotelBookings.map((b) => {
              const r = hotel.rooms.find((x) => x.id === b.roomId);
              return (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                      {b.guestName} <span className="font-mono text-xs text-gray-400">#{b.reference}</span>
                      <SourceBadge source={b.source} /> <StayStateChip booking={b} />
                    </p>
                    <p className="text-xs text-gray-500">
                      {r?.name} · {b.checkIn} → {b.checkOut}
                      {b.paymentMethod ? ` · ${PAYMENT_LABELS[b.paymentMethod] || b.paymentMethod}` : ""}
                    </p>
                    {b.notes && <p className="text-xs italic text-gray-400">{b.notes}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="font-bold" style={{ color: OCHRE }}>${b.totalPaid}</p>
                    <LifecycleButtons booking={b} busyId={busyBookingId} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
                    <button onClick={() => setInvoiceBooking(b)} className="flex items-center gap-1 rounded-md border-2 px-2 py-1 text-[11px] font-bold uppercase" style={{ borderColor: PETROL, color: PETROL }}>
                      <FileText className="h-3 w-3" /> Invoice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {invoiceBooking && <InvoiceModal hotel={hotel} booking={invoiceBooking} onClose={() => setInvoiceBooking(null)} />}
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
    onAddHotel({ name: name.trim(), area: area.trim() || "Asmara, Eritrea", tagline: tagline.trim() });
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
   HOME — brand homepage for eritreantourism.com. Search is embedded
   directly in the hero (Expedia pattern); a browsable "Popular hotels"
   section gives the page content even before anyone searches. Other
   verticals (tours/rentals/dining) are represented in the nav header
   as "Soon" tabs — see the generalized schema for how they'll plug in.
------------------------------------------------------------------- */

/* Explore rail destinations — static content entries; Asmara routes to
   the live content page, the rest to ComingSoon until their guides exist. */
const RAIL_PLACES = [
  { id: "asmara", name: "Asmara", sub: "La Piccola Roma", meta: "2,325 m · UNESCO 2017", seed: "er-asmara", live: true },
  { id: "massawa", name: "Massawa", sub: "Pearl of the Red Sea", meta: "Ottoman & coral-stone port", seed: "er-massawa" },
  { id: "keren", name: "Keren", sub: "City of gardens", meta: "Monday camel market", seed: "er-keren" },
  { id: "dahlak", name: "Dahlak", sub: "126-island archipelago", meta: "Diving · pristine reefs", seed: "er-dahlak" },
  { id: "qohaito", name: "Qohaito", sub: "Pre-Aksumite ruins", meta: "Highland plateau site", seed: "er-qohaito" },
];

function StayCard({ hotel, onClick }) {
  const fromPrice = Math.min(...hotel.rooms.map((r) => r.priceUsd));
  return (
    <button
      onClick={onClick}
      className="poster-card group block w-full overflow-hidden border-2 bg-white text-left"
      style={{ borderColor: INK, boxShadow: "6px 6px 0 rgba(18,58,43,0.85)" }}
    >
      <div className="relative h-52 overflow-hidden sm:h-60">
        <Poster seed={hotel.images[0]} w={800} h={480} className="absolute inset-0" tone={PETROL_DEEP} />
        <div className="absolute left-3 top-3 flex items-center gap-1 px-2 py-1" style={{ background: INK }}>
          <Star className="h-3 w-3" style={{ color: OCHRE, fill: OCHRE }} />
          <span className="font-utility text-[11px] font-bold" style={{ color: PLASTER }}>{hotel.rating}</span>
          <span className="font-utility text-[10px]" style={{ color: "rgba(246,240,224,0.6)" }}>({hotel.reviews})</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 p-4">
        <div>
          <h3 className="font-display text-xl uppercase" style={{ color: INK, fontWeight: 800 }}>{hotel.name}</h3>
          <p className="font-body mt-0.5 flex items-center gap-1 text-xs" style={{ color: PETROL }}>
            <MapPin className="h-3 w-3" /> {hotel.area}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-utility text-[10px] uppercase tracking-widest" style={{ color: PETROL }}>from</p>
          <p className="font-display text-2xl" style={{ color: OCHRE_DEEP, fontWeight: 800 }}>
            ${fromPrice}<span className="font-body text-xs font-normal" style={{ color: PETROL }}>/night</span>
          </p>
        </div>
      </div>
      <div className="font-body flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wider" style={{ background: PLASTER_DIM, color: INK, borderTop: `2px solid ${INK}` }}>
        Check live availability
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

function Home({ hotels, searchBarProps, onSearch, onOpenHotel, onExploreAsmara, onComingSoon, onNavigateItem }) {
  return (
    <div>
      {/* ---- poster hero ---- */}
      <section className="relative" style={{ background: GREEN_DEEP }}>
        <Poster seed="er-hero-highlands" w={1800} h={1000} className="absolute inset-0" tone={GREEN_DEEP} />
        <div className="pointer-events-none absolute inset-x-6 top-6 hidden h-[2px] sm:block" style={{ background: OCHRE, opacity: 0.7 }} />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-36 pt-14 sm:px-6 sm:pb-40 sm:pt-20">
          <p className="font-utility text-[11px] uppercase tracking-[0.28em]" style={{ color: "rgba(246,240,224,0.75)" }}>
            Est. on the Red Sea · Horn of Africa
          </p>
          <h1
            className="font-display mt-3 uppercase leading-[0.86]"
            style={{ color: PLASTER, fontWeight: 800, fontSize: "clamp(3.4rem, 12vw, 9rem)", letterSpacing: "0.01em" }}
          >
            Visit<br />Eritrea
          </h1>
          <div className="mt-5 flex items-center gap-4">
            <SpeedLines />
            <p className="font-body max-w-md text-sm sm:text-base" style={{ color: "rgba(246,240,224,0.85)" }}>
              Modernist Asmara, coral-stone Massawa, and 126 islands of the Dahlak —
              one guide for everything, bookable in USD.
            </p>
          </div>
        </div>
        <div className="relative z-20 mx-auto -mb-1 max-w-4xl px-4 sm:px-6" id="book-search">
          <div className="translate-y-1/2">
            <div className="border-2 p-4" style={{ background: PLASTER, borderColor: INK, boxShadow: "8px 8px 0 rgba(18,58,43,0.9)" }}>
              <SearchBar {...searchBarProps} onSearch={onSearch} />
              <p className="font-utility mt-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: PETROL, opacity: 0.7 }}>
                Live availability · pay in USD · settled locally
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- explore poster rail ---- */}
      <section className="pb-4 pt-40 sm:pt-44" style={{ background: PLASTER }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-utility text-[11px] uppercase tracking-[0.28em]" style={{ color: PETROL }}>Explore</p>
              <h2 className="font-display mt-1 uppercase" style={{ color: INK, fontWeight: 800, fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 0.95 }}>
                Five places to know
              </h2>
            </div>
            <p className="font-utility hidden text-[11px] uppercase tracking-[0.2em] sm:block" style={{ color: PETROL }}>drag / scroll →</p>
          </div>
        </div>
        <div className="mt-8 overflow-x-auto pb-6" style={{ scrollbarWidth: "thin" }}>
          <div className="mx-auto flex w-max gap-5 px-4 sm:px-6" style={{ minWidth: "100%" }}>
            {RAIL_PLACES.map((p, i) => (
              <button
                key={p.id}
                onClick={() => (p.live ? onExploreAsmara() : onComingSoon(p.name))}
                className="poster-card group relative block h-[380px] w-[260px] shrink-0 overflow-hidden border-2 text-left sm:h-[420px] sm:w-[300px]"
                style={{ borderColor: INK, boxShadow: "6px 6px 0 rgba(18,58,43,0.85)" }}
              >
                <Poster seed={p.seed} w={600} h={840} className="absolute inset-0" tone={i % 2 ? GREEN_DEEP : PETROL_DEEP} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(18,58,43,0.88) 100%)" }} />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                  <span className="font-utility text-[10px] uppercase tracking-[0.25em]" style={{ color: PLASTER }}>{String(i + 1).padStart(2, "0")}° stop</span>
                  {p.live ? (
                    <span className="font-utility px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white" style={{ background: GREEN }}>guide live</span>
                  ) : (
                    <span className="font-utility text-[9px] uppercase tracking-widest" style={{ color: "rgba(246,240,224,0.7)" }}>soon</span>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-utility text-[10px] uppercase tracking-[0.22em]" style={{ color: OCHRE }}>{p.sub}</p>
                  <h3 className="font-display mt-0.5 uppercase" style={{ color: PLASTER, fontWeight: 800, fontSize: "2.1rem", lineHeight: 0.9 }}>{p.name}</h3>
                  <p className="font-body mt-1.5 text-xs" style={{ color: "rgba(246,240,224,0.75)" }}>{p.meta}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---- stay: live hotels from Supabase ---- */}
      <section className="py-16" style={{ background: PLASTER }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-utility text-[11px] uppercase tracking-[0.28em]" style={{ color: GREEN }}>Stay · live now</p>
              <h2 className="font-display mt-1 uppercase" style={{ color: INK, fontWeight: 800, fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 0.95 }}>
                Book tonight in Asmara
              </h2>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {hotels.map((h) => (
              <StayCard key={h.id} hotel={h} onClick={() => onOpenHotel(h.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- directory grid ---- */}
      <section className="py-16" style={{ background: PLASTER_DIM, borderTop: `2px solid ${INK}` }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-utility text-[11px] uppercase tracking-[0.28em]" style={{ color: PETROL }}>The full guide</p>
          <h2 className="font-display mt-1 max-w-xl uppercase" style={{ color: INK, fontWeight: 800, fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 0.95 }}>
            Everything a visit needs, one directory
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-px border-2 lg:grid-cols-4" style={{ background: INK, borderColor: INK }}>
            {SITE_MAP.map((section) => {
              const liveItem = section.items.find((it) => it.status === "live");
              return (
                <button
                  key={section.id}
                  onClick={() => onNavigateItem(liveItem || { ...section.items[0], label: section.label })}
                  className="group flex flex-col gap-3 p-5 text-left transition-colors hover:bg-white"
                  style={{ background: PLASTER }}
                >
                  <div className="flex items-center justify-between">
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: liveItem ? OCHRE_DEEP : PETROL }} />
                    {liveItem ? (
                      <span className="font-utility px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white" style={{ background: GREEN }}>live</span>
                    ) : (
                      <span className="font-utility text-[9px] uppercase tracking-widest" style={{ color: ROSE }}>soon</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg uppercase" style={{ color: INK, fontWeight: 800 }}>{section.label}</h3>
                    <p className="font-body mt-0.5 text-xs" style={{ color: PETROL }}>
                      {section.items.slice(0, 3).map((it) => it.label).join(" · ")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}


/* ------------------------------------------------------------------
   COMING SOON — generic placeholder for any not-yet-built site-map item.
------------------------------------------------------------------- */

function ComingSoon({ label, onExploreAsmara, onBrowseHotels }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Clock className="mx-auto mb-4 h-10 w-10" style={{ color: OCHRE }} />
      <h2 className="text-lg font-black" style={{ color: INK }}>{label}</h2>
      <p className="mt-2 text-sm text-gray-500">
        This section is launching soon as eritreantourism.com grows into a full guide to Eritrea.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <button onClick={onBrowseHotels} className="rounded-md py-2.5 text-sm font-bold uppercase tracking-wide text-white" style={{ background: OCHRE }}>
          Browse Hotels
        </button>
        <button onClick={onExploreAsmara} className="rounded-md border-2 py-2.5 text-sm font-bold uppercase tracking-wide" style={{ borderColor: PETROL, color: PETROL }}>
          Explore Asmara
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   EXPLORE HUB — Cities/Beaches/Mountains/etc. category grid.
   Only Asmara is a real content page today; the rest route to ComingSoon.
------------------------------------------------------------------- */

function ExploreHub({ onOpenContent, onComingSoon }) {
  const categories = [
    { id: "asmara", label: "Asmara", icon: Building2, live: true, blurb: "Italian modernist architecture, coffee culture, and the highland capital." },
    { id: "cities", label: "Other Cities", icon: Building2, live: false, blurb: "Massawa, Keren, and more." },
    { id: "beaches", label: "Beaches", icon: Waves, live: false, blurb: "Red Sea coastline and the Dahlak Archipelago." },
    { id: "mountains", label: "Mountains", icon: Compass, live: false, blurb: "Highland scenery and trekking routes." },
    { id: "historical", label: "Historical Sites", icon: Landmark, live: false, blurb: "Qohaito, ancient ruins, and colonial-era landmarks." },
    { id: "parks", label: "National Parks", icon: Compass, live: false, blurb: "Protected wildlife and nature reserves." },
    { id: "museums", label: "Museums", icon: Building2, live: false, blurb: "National Museum of Eritrea and regional collections." },
  ];
  return (
    <div>
      <Hero imageSeed="asmara-explore-hero" height="h-56 sm:h-64">
        <SpeedLines className="mb-2" />
        <h1 className="text-2xl font-black text-white sm:text-3xl">Explore Eritrea</h1>
        <p className="mt-1 max-w-md text-xs font-medium uppercase tracking-widest text-white/80 sm:text-sm">
          Cities, landmarks, and landscapes worth knowing before you go
        </p>
      </Hero>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => (c.live ? onOpenContent(c.id) : onComingSoon(c.label))}
                className={`flex items-start gap-3 rounded-xl border-2 bg-white p-4 text-left transition-shadow ${c.live ? "hover:shadow-md" : "opacity-60"}`}
                style={{ borderColor: CARD_BORDER }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: c.live ? OCHRE : "#c9c2b0" }}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: INK }}>{c.label}</h3>
                    {!c.live && <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-400">Soon</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{c.blurb}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   CONTENT PAGE — the real Asmara write-up, proving the Explore pattern
   and cross-linking into Stay (hotels) the way a real directory should.
------------------------------------------------------------------- */

function AsmaraContentPage({ onBack, onBrowseHotels }) {
  return (
    <div>
      <Hero imageSeed="asmara-content-hero" height="h-64 sm:h-80">
        <button onClick={onBack} className="mb-2 flex w-fit items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-white/80 hover:text-white">
          <ArrowLeft className="h-3 w-3" /> Explore
        </button>
        <h1 className="text-2xl font-black text-white sm:text-4xl">Asmara</h1>
        <p className="mt-1 max-w-md text-xs font-medium uppercase tracking-widest text-white/80 sm:text-sm">
          Eritrea's highland capital, a living museum of modernist architecture
        </p>
      </Hero>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <p className="text-sm leading-relaxed text-gray-700">
          Perched at roughly 2,300 meters in the Eritrean highlands, Asmara is best known for one of the
          world's best-preserved collections of early modernist and Art Deco architecture, built during
          the Italian colonial period of the 1930s. UNESCO inscribed the city center as a World Heritage
          Site in 2017, citing its unusually intact urban fabric.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          Beyond the buildings, Asmara moves at an unhurried pace — tree-lined Harnet Avenue fills with
          strolling crowds in the evenings, and the city's coffee culture (a legacy of the same era) runs
          deep, with traditional ceremonies still a centerpiece of daily life.
        </p>

        <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide" style={{ color: PETROL }}>Landmarks not to miss</h2>
        <div className="space-y-2">
          {[
            { name: "Fiat Tagliero Building", note: "Futurist former gas station with dramatic cantilevered wings" },
            { name: "Asmara Opera House", note: "Grand early-1900s theater on Harnet Avenue" },
            { name: "National Museum of Eritrea", note: "Archaeology, culture, and natural history collections" },
            { name: "Asmara's Great Mosque & Cathedral", note: "Landmarks reflecting the city's mixed religious heritage" },
          ].map((l) => (
            <div key={l.name} className="flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm">
              <Landmark className="mt-0.5 h-4 w-4 shrink-0" style={{ color: OCHRE }} />
              <div>
                <p className="font-semibold" style={{ color: INK }}>{l.name}</p>
                <p className="text-xs text-gray-500">{l.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border-2 p-5 text-center" style={{ borderColor: CARD_BORDER, background: "#fff" }}>
          <p className="text-sm text-gray-600">Planning a visit?</p>
          <button onClick={onBrowseHotels} className="mt-3 rounded-md px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white" style={{ background: OCHRE }}>
            See Hotels in Asmara
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comingSoonLabel, setComingSoonLabel] = useState("");
  const [view, setView] = useState("home"); // home | explore | content | results | hotel | checkout | confirmation | partner | comingsoon
  const [query, setQuery] = useState("Asmara");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [openHotelId, setOpenHotelId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);

  const [loadError, setLoadError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const hotels = await fetchHotels();
      const allRoomIds = hotels.flatMap((h) => h.rooms.map((r) => r.id));
      const bookings = await fetchBookingsForListings(allRoomIds);
      setState({ hotels, bookings });
      setLoadError(null);
    } catch (err) {
      console.error("Failed to load from Supabase", err);
      setLoadError(err.message || "Failed to load data from Supabase");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addBooking = useCallback(
    async (booking) => {
      const saved = await createBooking(booking);
      await reload();
      return saved;
    },
    [reload]
  );
  const updateRoom = useCallback(
    async (hotelId, roomId, patch) => {
      await updateListing(roomId, patch);
      await reload();
    },
    [reload]
  );
  const addRoom = useCallback(
    async (hotelId, room) => {
      await addListing(hotelId, room);
      await reload();
    },
    [reload]
  );
  const removeRoom = useCallback(
    async (hotelId, roomId) => {
      await removeListing(roomId);
      await reload();
    },
    [reload]
  );
  const addHotel = useCallback(
    async (hotel) => {
      await addHotelPartner(hotel);
      await reload();
    },
    [reload]
  );
  const addFrontDeskBooking = useCallback(
    async (booking) => {
      const saved = await createFrontDeskBooking(booking);
      await reload();
      return saved;
    },
    [reload]
  );
  const checkInGuest = useCallback(
    async (bookingId) => {
      await checkInBooking(bookingId);
      await reload();
    },
    [reload]
  );
  const checkOutGuest = useCallback(
    async (bookingId) => {
      await checkOutBooking(bookingId);
      await reload();
    },
    [reload]
  );

  if (loadError) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-sm text-red-700">
        Couldn't connect to Supabase: {loadError}. Check that <code>VITE_SUPABASE_URL</code> and{" "}
        <code>VITE_SUPABASE_ANON_KEY</code> are set in <code>.env.local</code> and that the schema/seed SQL has been run.
      </div>
    );
  }
  if (!state) return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Loading…</div>;

  const searchBarProps = { query, setQuery, checkIn, setCheckIn, checkOut, setCheckOut, onSearch: () => setView("results") };

  if (view === "partner") {
    return (
      <PartnerArea
        hotels={state.hotels} bookings={state.bookings}
        onUpdateRoom={updateRoom} onAddRoom={addRoom} onRemoveRoom={removeRoom} onAddHotel={addHotel}
        onCreateFrontDeskBooking={addFrontDeskBooking} onCheckIn={checkInGuest} onCheckOut={checkOutGuest}
        onExit={() => setView("home")}
      />
    );
  }

  const openHotel = state.hotels.find((h) => h.id === openHotelId);

  function handleDrawerNavigate(item) {
    setDrawerOpen(false);
    if (item.status === "soon") {
      setComingSoonLabel(item.label);
      setView("comingsoon");
      return;
    }
    if (item.route) {
      navigate(item.route);
      return;
    }
    if (item.view === "content") {
      setView("content");
    } else {
      setView(item.view);
    }
  }

  return (
    <div className="font-body min-h-screen" style={{ background: PLASTER, fontFamily: "'Archivo', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{FONT_CSS}</style>
      {view !== "checkout" && view !== "confirmation" && (
        <NavHeader
          onOpenMenu={() => setDrawerOpen(true)}
          onNavigate={setView}
          onNavigateItem={handleDrawerNavigate}
          onBookStay={() => {
            setView("home");
            setTimeout(() => document.getElementById("book-search")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
          }}
        />
      )}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onNavigateItem={handleDrawerNavigate} />

      {view === "home" && (
        <Home
          hotels={state.hotels}
          searchBarProps={searchBarProps}
          onSearch={() => setView("results")}
          onOpenHotel={(id) => { setOpenHotelId(id); setView("hotel"); }}
          onExploreAsmara={() => setView("content")}
          onComingSoon={(label) => { setComingSoonLabel(label); setView("comingsoon"); }}
          onNavigateItem={handleDrawerNavigate}
        />
      )}

      {view === "explore" && (
        <ExploreHub
          onOpenContent={() => setView("content")}
          onComingSoon={(label) => { setComingSoonLabel(label); setView("comingsoon"); }}
        />
      )}

      {view === "content" && (
        <AsmaraContentPage onBack={() => setView("explore")} onBrowseHotels={() => setView("home")} />
      )}

      {view === "comingsoon" && (
        <ComingSoon
          label={comingSoonLabel}
          onExploreAsmara={() => setView("content")}
          onBrowseHotels={() => setView("home")}
        />
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
          setCheckIn={setCheckIn}
          setCheckOut={setCheckOut}
          onBack={() => setView("results")}
          onSelectRoom={(room) => { setSelectedRoom(room); setView("checkout"); }}
        />
      )}

      {view === "checkout" && openHotel && selectedRoom && (
        <Checkout
          hotel={openHotel} room={selectedRoom} checkIn={checkIn} checkOut={checkOut}
          onBack={() => setView("hotel")}
          onConfirm={async ({ guestName, guestEmail }) => {
            const nights = dateRange(checkIn, checkOut).length || 1;
            const saved = await addBooking({
              roomId: selectedRoom.id,
              guestName,
              guestEmail,
              checkIn,
              checkOut,
              totalPaid: selectedRoom.priceUsd * nights,
            });
            setLastBooking(saved);
            setView("confirmation");
          }}
        />
      )}

      {view === "confirmation" && openHotel && selectedRoom && lastBooking && (
        <Confirmation hotel={openHotel} room={selectedRoom} booking={lastBooking} onDone={() => setView("home")} />
      )}

      <footer style={{ background: INK }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <SpeedLines />
              <p className="font-display mt-3 text-2xl uppercase" style={{ color: PLASTER, fontWeight: 800 }}>
                Eritrean<span style={{ color: OCHRE }}>Tourism</span>
              </p>
              <p className="font-body mt-2 max-w-sm text-sm" style={{ color: "rgba(246,240,224,0.6)" }}>
                The definitive guide to visiting Eritrea — culture and places first,
                stays and experiences bookable when you're ready.
              </p>
            </div>
            <div className="font-utility space-y-1.5 text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(246,240,224,0.55)" }}>
              <p>Bookings settled locally in Eritrea</p>
              <p>All hotel rates quoted in USD</p>
              <button onClick={() => setView("partner")} className="underline" style={{ color: "rgba(246,240,224,0.4)" }}>
                Partner &amp; admin access
              </button>
            </div>
          </div>
          <div className="font-utility mt-8 flex flex-col gap-2 border-t pt-4 text-[10px] uppercase tracking-[0.2em] sm:flex-row sm:justify-between" style={{ borderColor: "rgba(246,240,224,0.15)", color: "rgba(246,240,224,0.4)" }}>
            <span>© {new Date().getFullYear()} eritreantourism.com</span>
            <span>Photography placeholders pending licensed images</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
