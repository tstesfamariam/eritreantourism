import React, { useState, useEffect, useRef } from "react";
import {
  Search, MapPin, Star, ChevronRight, ChevronDown, Menu, X, ArrowRight,
  Hotel, Compass, UtensilsCrossed, Car, CalendarDays, Building2, Users, Landmark
} from "lucide-react";

/* ==================================================================
   ERITREANTOURISM.COM — design showcase
   Direction: vintage aviation-era travel poster, rooted in Asmara's
   Italian-futurist heritage (Fiat Tagliero wings, speed lines,
   duotone poster printing). Self-contained mock data for preview;
   port into the live app by swapping the SEED data for bookingApi.
================================================================== */

/* ---------- tokens ----------
   Palette derived from the Eritrean flag, deepened to print-poster
   registers so it carries meaning without reading as raw flag graphics:
   green  — agriculture, the highlands (flag's upper triangle)
   red    — the sacrifice of the independence struggle (central triangle)
   blue   — the Red Sea (lower triangle)
   gold   — the olive wreath emblem, mineral wealth
   The colonial-era heritage stays in the *typography and poster layout*;
   the *color* belongs to the independence generation. */
const T = {
  ink: "#123A2B",          // highland green ink (structural dark)
  green: "#2F7C52",        // living green (accents, "live" markers)
  greenDeep: "#1A5038",
  petrol: "#1F5673",       // Red Sea blue
  petrolDeep: "#143D52",
  ochre: "#D9A22E",        // olive-wreath gold
  ochreDeep: "#B27F14",
  paper: "#F6F0E0",        // sun-bleached plaster (unchanged heritage neutral)
  paperDim: "#ECE5CF",
  rose: "#B5342A",         // independence red — used with intent, not decoration
  line: "#D6CFB4",
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders:opsz,wght@10..72,400;10..72,600;10..72,800&family=Archivo:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500&display=swap');
.font-display { font-family: 'Big Shoulders', sans-serif; }
.font-body { font-family: 'Archivo', sans-serif; }
.font-utility { font-family: 'Space Grotesk', monospace; }
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } .reveal { transition: none !important; } }
.duotone { filter: grayscale(1) contrast(1.05) brightness(0.95); }
.reveal { opacity: 0; transform: translateY(18px); transition: opacity .7s ease, transform .7s ease; }
.reveal.in { opacity: 1; transform: none; }
.poster-card:hover .poster-img { transform: scale(1.04); }
.poster-img { transition: transform .6s ease; }
::selection { background: ${T.ochre}; color: ${T.ink}; }
`;

const img = (seed, w = 900, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

/* ---------- mock data (replace with bookingApi in the live app) ---------- */
const PLACES = [
  { id: "asmara", name: "Asmara", sub: "La Piccola Roma", meta: "2,325 m · UNESCO 2017", seed: "er-asmara", live: true },
  { id: "massawa", name: "Massawa", sub: "Pearl of the Red Sea", meta: "Ottoman & coral-stone port", seed: "er-massawa" },
  { id: "keren", name: "Keren", sub: "City of gardens", meta: "Monday camel market", seed: "er-keren" },
  { id: "dahlak", name: "Dahlak", sub: "126-island archipelago", meta: "Diving · pristine reefs", seed: "er-dahlak" },
  { id: "qohaito", name: "Qohaito", sub: "Pre-Aksumite ruins", meta: "Highland plateau site", seed: "er-qohaito" },
];

const HOTELS = [
  { id: "ap", name: "Asmara Palace Hotel", area: "Airport Road, Asmara", rating: 4.1, reviews: 459, from: 140, seed: "er-hotel-1" },
  { id: "ch", name: "Crystal Hotel", area: "Bihat Street, City Center", rating: 3.8, reviews: 117, from: 99, seed: "er-hotel-2" },
];

const NAV = [
  { id: "explore", label: "Explore", items: ["Asmara", "Massawa", "Keren", "Dahlak Islands", "Historical Sites", "Museums"] },
  { id: "stay", label: "Stay", items: ["Hotels", "Resorts", "Guest Houses", "Camping"] },
  { id: "eat", label: "Eat", items: ["Restaurants", "Coffee Houses", "Traditional Food"] },
  { id: "experience", label: "Experience", items: ["Tours", "Hiking", "Cycling", "Diving", "Bird Watching"] },
  { id: "travel", label: "Travel", items: ["Flights", "Visa Information", "Car Rental", "Bus Routes", "Ferries"] },
  { id: "events", label: "Events", items: ["Festivals", "Cycling Races", "Conferences"] },
  { id: "directory", label: "Directory", items: ["Banks", "Hospitals", "Pharmacies", "Embassies", "Telecom"] },
];

const DIRECTORY = [
  { icon: Hotel, label: "Stay", note: "Hotels · guest houses", live: true },
  { icon: Compass, label: "Experience", note: "Tours · diving · hiking" },
  { icon: UtensilsCrossed, label: "Eat", note: "Restaurants · coffee" },
  { icon: Car, label: "Travel", note: "Rentals · routes · visas" },
  { icon: CalendarDays, label: "Events", note: "Festivals · races" },
  { icon: Building2, label: "Directory", note: "Banks · embassies" },
  { icon: Users, label: "Services", note: "Guides · translators" },
  { icon: Landmark, label: "Heritage", note: "UNESCO sites · museums" },
];

/* ---------- shared bits ---------- */

/* Tricolor speed lines: the futurist motion motif carrying the flag's
   green / red / blue in its top-to-bottom order — heritage form,
   independence meaning, in one mark. */
function SpeedLines({ className = "" }) {
  return (
    <div className={`flex flex-col gap-[4px] ${className}`} aria-hidden="true">
      <div className="h-[3px] w-16" style={{ background: T.green }} />
      <div className="h-[3px] w-11" style={{ background: T.rose }} />
      <div className="h-[3px] w-6" style={{ background: T.petrol }} />
    </div>
  );
}

function Eyebrow({ children, light }) {
  return (
    <p className="font-utility text-[11px] uppercase tracking-[0.28em]" style={{ color: light ? "rgba(246,239,223,0.75)" : T.petrol }}>
      {children}
    </p>
  );
}

/* duotone poster image: grayscale photo + petrol multiply + paper screen */
function Poster({ seed, w, h, className = "", tone = T.petrol }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={img(seed, w, h)} alt="" className="duotone poster-img absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 mix-blend-multiply" style={{ background: tone }} />
      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: T.paper, opacity: 0.35 }} />
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    el.querySelectorAll(".reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ---------- header ---------- */

function Header({ onMenu }) {
  const [open, setOpen] = useState(null);
  const timer = useRef(null);
  const show = (id) => { clearTimeout(timer.current); setOpen(id); };
  const hide = () => { timer.current = setTimeout(() => setOpen(null), 140); };

  return (
    <header className="sticky top-0 z-40" style={{ background: T.paper, borderBottom: `1px solid ${T.line}` }}>
      {/* utility strip */}
      <div className="font-utility hidden items-center justify-between px-6 py-1.5 text-[10px] uppercase tracking-[0.2em] sm:flex" style={{ background: T.ink, color: T.paperDim }}>
        <span>Asmara · 15.34°N 38.93°E · alt. 2,325 m</span>
        <span>Nakfa (ERN) · hotels priced in USD</span>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenu} aria-label="Open menu" className="rounded p-1.5 lg:hidden" style={{ color: T.petrol }}>
            <Menu className="h-5 w-5" />
          </button>
          <a href="#top" className="flex items-center gap-2.5">
            <SpeedLines className="hidden sm:flex" />
            <span className="font-display text-xl font-800 uppercase tracking-wide" style={{ color: T.ink, fontWeight: 800 }}>
              Eritrean<span style={{ color: T.ochre }}>Tourism</span>
            </span>
          </a>
        </div>
        <nav className="hidden items-center lg:flex">
          {NAV.map((s) => (
            <div key={s.id} className="relative" onMouseEnter={() => show(s.id)} onMouseLeave={hide}>
              <button
                onClick={() => setOpen(open === s.id ? null : s.id)}
                className="font-body flex items-center gap-1 px-3 py-2 text-[13px] font-semibold uppercase tracking-wider"
                style={{ color: open === s.id ? T.ochreDeep : T.ink }}
              >
                {s.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === s.id ? "rotate-180" : ""}`} />
              </button>
              {open === s.id && (
                <div className="absolute left-0 top-full w-56 border shadow-lg" style={{ background: T.paper, borderColor: T.line }}>
                  <div className="h-[3px]" style={{ background: T.ochre }} />
                  {s.items.map((item, i) => (
                    <a
                      key={item}
                      href="#directory"
                      className="font-body flex items-center justify-between px-4 py-2.5 text-sm hover:pl-5"
                      style={{ color: T.ink, borderTop: i ? `1px solid ${T.line}` : "none", transition: "padding .15s ease" }}
                    >
                      {item}
                      {!(s.id === "stay" && item === "Hotels") && !(s.id === "explore" && item === "Asmara") && (
                        <span className="font-utility text-[9px] uppercase tracking-widest" style={{ color: T.rose }}>soon</span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a href="#stay" className="font-body ml-3 px-4 py-2 text-[13px] font-bold uppercase tracking-wider text-white" style={{ background: T.rose }}>
            Book a stay
          </a>
        </nav>
      </div>
    </header>
  );
}

function Drawer({ open, onClose }) {
  const [ex, setEx] = useState("explore");
  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[86%] max-w-sm overflow-y-auto transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: T.paper }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.line}` }}>
          <span className="font-display text-lg uppercase" style={{ color: T.ink, fontWeight: 800 }}>
            Eritrean<span style={{ color: T.ochre }}>Tourism</span>
          </span>
          <button onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" style={{ color: T.petrol }} /></button>
        </div>
        {NAV.map((s) => (
          <div key={s.id} style={{ borderBottom: `1px solid ${T.line}` }}>
            <button
              onClick={() => setEx(ex === s.id ? null : s.id)}
              className="font-body flex w-full items-center justify-between px-5 py-3.5 text-sm font-bold uppercase tracking-wider"
              style={{ color: T.ink }}
            >
              {s.label}
              <ChevronRight className={`h-4 w-4 transition-transform ${ex === s.id ? "rotate-90" : ""}`} style={{ color: T.ochre }} />
            </button>
            {ex === s.id && (
              <div className="pb-3">
                {s.items.map((item) => (
                  <a key={item} href="#directory" onClick={onClose} className="font-body flex items-center justify-between px-7 py-2 text-sm" style={{ color: T.petrol }}>
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>
    </>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden" style={{ background: T.greenDeep }}>
      <Poster seed="er-hero-highlands" w={1800} h={1000} className="absolute inset-0" tone={T.greenDeep} />
      {/* poster frame rules */}
      <div className="pointer-events-none absolute inset-x-6 top-6 hidden h-[2px] sm:block" style={{ background: T.ochre, opacity: 0.7 }} />
      <div className="pointer-events-none absolute inset-x-6 bottom-6 hidden h-[2px] sm:block" style={{ background: T.ochre, opacity: 0.7 }} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-40 pt-16 sm:px-6 sm:pb-44 sm:pt-24">
        <Eyebrow light>Est. on the Red Sea · Horn of Africa</Eyebrow>
        <h1
          className="font-display mt-3 uppercase leading-[0.86]"
          style={{ color: T.paper, fontWeight: 800, fontSize: "clamp(4rem, 14vw, 11rem)", letterSpacing: "0.01em" }}
        >
          Visit<br />Eritrea
        </h1>
        <div className="mt-5 flex items-center gap-4">
          <SpeedLines />
          <p className="font-body max-w-md text-sm sm:text-base" style={{ color: "rgba(246,239,223,0.85)" }}>
            Modernist Asmara, coral-stone Massawa, and 126 islands of the Dahlak —
            one guide for everything, bookable in USD.
          </p>
        </div>
      </div>

      {/* search card overlapping the fold */}
      <div className="relative z-20 mx-auto -mb-1 max-w-4xl px-4 sm:px-6">
        <div className="translate-y-1/2">
          <SearchCard />
        </div>
      </div>
    </section>
  );
}

function SearchCard() {
  const [q, setQ] = useState("Asmara");
  const [inD, setInD] = useState("");
  const [outD, setOutD] = useState("");
  const label = (t) => (
    <span className="font-utility mb-1 block text-[10px] uppercase tracking-[0.22em]" style={{ color: T.petrol }}>{t}</span>
  );
  const box = { border: `2px solid ${T.ink}`, background: "#fff" };
  return (
    <div className="border-2 p-4 shadow-[8px_8px_0_rgba(20,35,31,0.9)]" style={{ background: T.paper, borderColor: T.ink }}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-9">
        <label className="sm:col-span-3">
          {label("Destination")}
          <div className="flex items-center gap-2 px-3 py-2.5" style={box}>
            <MapPin className="h-4 w-4 shrink-0" style={{ color: T.ochreDeep }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Where in Eritrea?" className="font-body w-full bg-transparent text-sm outline-none" style={{ color: T.ink }} />
          </div>
        </label>
        <label className="sm:col-span-2">
          {label("Check-in")}
          <input type="date" value={inD} onChange={(e) => setInD(e.target.value)} className="font-body w-full px-3 py-2.5 text-sm outline-none" style={box} />
        </label>
        <label className="sm:col-span-2">
          {label("Check-out")}
          <input type="date" value={outD} min={inD} onChange={(e) => setOutD(e.target.value)} className="font-body w-full px-3 py-2.5 text-sm outline-none" style={box} />
        </label>
        <div className="flex items-end sm:col-span-2">
          <button
            className="font-body flex w-full items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider text-white transition-transform active:translate-y-[2px]"
            style={{ background: T.rose, border: `2px solid ${T.ink}` }}
          >
            <Search className="h-4 w-4" /> Search stays
          </button>
        </div>
      </div>
      <p className="font-utility mt-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: T.petrol, opacity: 0.7 }}>
        Live availability · pay in USD · settled locally
      </p>
    </div>
  );
}

/* ---------- explore: poster rail ---------- */

function ExploreRail() {
  const ref = useReveal();
  return (
    <section ref={ref} id="explore" className="pb-4 pt-32 sm:pt-36" style={{ background: T.paper }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal flex items-end justify-between">
          <div>
            <Eyebrow>Explore</Eyebrow>
            <h2 className="font-display mt-1 uppercase" style={{ color: T.ink, fontWeight: 800, fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 0.95 }}>
              Five places to know
            </h2>
          </div>
          <p className="font-utility hidden text-[11px] uppercase tracking-[0.2em] sm:block" style={{ color: T.petrol }}>drag / scroll →</p>
        </div>
      </div>
      <div className="mt-8 overflow-x-auto pb-6" style={{ scrollbarWidth: "thin" }}>
        <div className="mx-auto flex w-max gap-5 px-4 sm:px-6" style={{ minWidth: "100%" }}>
          {PLACES.map((p, i) => (
            <a
              key={p.id}
              href="#asmara"
              className="poster-card reveal group relative block h-[380px] w-[260px] shrink-0 overflow-hidden border-2 sm:h-[420px] sm:w-[300px]"
              style={{ borderColor: T.ink, transitionDelay: `${i * 70}ms`, boxShadow: "6px 6px 0 rgba(20,35,31,0.85)" }}
            >
              <Poster seed={p.seed} w={600} h={840} className="absolute inset-0" tone={i % 2 ? T.greenDeep : T.petrolDeep} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(20,35,31,0.88) 100%)" }} />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                <span className="font-utility text-[10px] uppercase tracking-[0.25em]" style={{ color: T.paper }}>{String(i + 1).padStart(2, "0")}° stop</span>
                {p.live ? (
                  <span className="font-utility px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white" style={{ background: T.green }}>guide live</span>
                ) : (
                  <span className="font-utility text-[9px] uppercase tracking-widest" style={{ color: "rgba(246,239,223,0.7)" }}>soon</span>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-utility text-[10px] uppercase tracking-[0.22em]" style={{ color: T.ochre }}>{p.sub}</p>
                <h3 className="font-display mt-0.5 uppercase" style={{ color: T.paper, fontWeight: 800, fontSize: "2.1rem", lineHeight: 0.9 }}>{p.name}</h3>
                <p className="font-body mt-1.5 text-xs" style={{ color: "rgba(246,239,223,0.75)" }}>{p.meta}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- editorial feature: Asmara / Fiat Tagliero ---------- */

function AsmaraFeature() {
  const ref = useReveal();
  return (
    <section ref={ref} id="asmara" className="relative overflow-hidden py-20" style={{ background: T.petrolDeep }}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="reveal relative order-2 lg:order-1">
          <div className="relative h-[340px] border-2 sm:h-[420px]" style={{ borderColor: T.ochre }}>
            <Poster seed="er-tagliero" w={900} h={700} className="absolute inset-0" tone={T.petrolDeep} />
          </div>
          {/* cantilever wing rule — the Tagliero signature */}
          <div className="absolute -right-4 top-10 hidden h-[3px] w-24 sm:block" style={{ background: T.ochre }} />
          <div className="absolute -left-4 top-16 hidden h-[3px] w-16 sm:block" style={{ background: T.ochre, opacity: 0.6 }} />
          <p className="font-utility mt-3 text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(246,239,223,0.5)" }}>
            Fiat Tagliero, 1938 — placeholder image pending licensed photography
          </p>
        </div>
        <div className="order-1 lg:order-2">
          <div className="reveal">
            <Eyebrow light>Feature · La Piccola Roma</Eyebrow>
            <h2 className="font-display mt-2 uppercase leading-[0.9]" style={{ color: T.paper, fontWeight: 800, fontSize: "clamp(2.4rem,6vw,4rem)" }}>
              A capital built<br />like a manifesto
            </h2>
          </div>
          <div className="reveal mt-5 space-y-4" style={{ transitionDelay: "120ms" }}>
            <p className="font-body text-sm leading-relaxed sm:text-base" style={{ color: "rgba(246,239,223,0.82)" }}>
              At 2,325 meters, Asmara holds one of the world's most intact collections of
              early-modernist architecture — futurist petrol stations with cantilevered
              concrete wings, cinemas, and villas from the 1930s, inscribed by UNESCO in 2017.
            </p>
            <p className="font-body text-sm leading-relaxed sm:text-base" style={{ color: "rgba(246,239,223,0.82)" }}>
              Evenings belong to Harnet Avenue's passeggiata and a coffee culture where the
              ceremony still anchors daily life.
            </p>
          </div>
          <div className="reveal mt-7 flex flex-wrap gap-3" style={{ transitionDelay: "220ms" }}>
            <a href="#stay" className="font-body inline-flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider" style={{ background: T.ochre, color: T.ink }}>
              Read the Asmara guide <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#stay" className="font-body inline-flex items-center gap-2 border px-5 py-3 text-sm font-bold uppercase tracking-wider" style={{ borderColor: "rgba(246,239,223,0.4)", color: T.paper }}>
              Hotels in Asmara
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- stay ---------- */

function Stay() {
  const ref = useReveal();
  return (
    <section ref={ref} id="stay" className="py-20" style={{ background: T.paper }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal flex items-end justify-between">
          <div>
            <Eyebrow>Stay · live now</Eyebrow>
            <h2 className="font-display mt-1 uppercase" style={{ color: T.ink, fontWeight: 800, fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 0.95 }}>
              Book tonight in Asmara
            </h2>
          </div>
          <a href="#top" className="font-body hidden items-center gap-1.5 text-sm font-bold uppercase tracking-wider sm:flex" style={{ color: T.petrol }}>
            All hotels <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {HOTELS.map((h, i) => (
            <a
              key={h.id}
              href="#top"
              className="poster-card reveal group block overflow-hidden border-2 bg-white"
              style={{ borderColor: T.ink, boxShadow: "6px 6px 0 rgba(20,35,31,0.85)", transitionDelay: `${i * 90}ms` }}
            >
              <div className="relative h-52 overflow-hidden sm:h-60">
                <Poster seed={h.seed} w={800} h={480} className="absolute inset-0" tone={T.petrol} />
                <div className="absolute left-3 top-3 flex items-center gap-1 px-2 py-1" style={{ background: T.ink }}>
                  <Star className="h-3 w-3" style={{ color: T.ochre, fill: T.ochre }} />
                  <span className="font-utility text-[11px] font-bold" style={{ color: T.paper }}>{h.rating}</span>
                  <span className="font-utility text-[10px]" style={{ color: "rgba(246,239,223,0.6)" }}>({h.reviews})</span>
                </div>
              </div>
              <div className="flex items-end justify-between gap-3 p-4">
                <div>
                  <h3 className="font-display text-xl uppercase" style={{ color: T.ink, fontWeight: 800 }}>{h.name}</h3>
                  <p className="font-body mt-0.5 flex items-center gap-1 text-xs" style={{ color: T.petrol }}>
                    <MapPin className="h-3 w-3" /> {h.area}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-utility text-[10px] uppercase tracking-widest" style={{ color: T.petrol }}>from</p>
                  <p className="font-display text-2xl" style={{ color: T.ochreDeep, fontWeight: 800 }}>
                    ${h.from}<span className="font-body text-xs font-normal" style={{ color: T.petrol }}>/night</span>
                  </p>
                </div>
              </div>
              <div className="font-body flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wider" style={{ background: T.paperDim, color: T.ink, borderTop: `2px solid ${T.ink}` }}>
                Check live availability
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- directory grid ---------- */

function Directory() {
  const ref = useReveal();
  return (
    <section ref={ref} id="directory" className="py-20" style={{ background: T.paperDim, borderTop: `2px solid ${T.ink}` }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal">
          <Eyebrow>The full guide</Eyebrow>
          <h2 className="font-display mt-1 max-w-xl uppercase" style={{ color: T.ink, fontWeight: 800, fontSize: "clamp(2rem,5vw,3.2rem)", lineHeight: 0.95 }}>
            Everything a visit needs, one directory
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-px border-2 lg:grid-cols-4" style={{ background: T.ink, borderColor: T.ink }}>
          {DIRECTORY.map((d, i) => {
            const Icon = d.icon;
            return (
              <a
                key={d.label}
                href="#top"
                className="reveal group flex flex-col gap-3 p-5 transition-colors"
                style={{ background: T.paper, transitionDelay: `${i * 50}ms` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = T.paper)}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5" style={{ color: d.live ? T.ochreDeep : T.petrol }} />
                  {d.live ? (
                    <span className="font-utility px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white" style={{ background: T.green }}>live</span>
                  ) : (
                    <span className="font-utility text-[9px] uppercase tracking-widest" style={{ color: T.rose }}>soon</span>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-lg uppercase" style={{ color: T.ink, fontWeight: 800 }}>{d.label}</h3>
                  <p className="font-body mt-0.5 text-xs" style={{ color: T.petrol }}>{d.note}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer style={{ background: T.ink }}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <SpeedLines />
            <p className="font-display mt-3 text-3xl uppercase" style={{ color: T.paper, fontWeight: 800 }}>
              Eritrean<span style={{ color: T.ochre }}>Tourism</span>
            </p>
            <p className="font-body mt-2 max-w-sm text-sm" style={{ color: "rgba(246,239,223,0.6)" }}>
              The definitive guide to visiting Eritrea — culture and places first,
              stays and experiences bookable when you're ready.
            </p>
          </div>
          <div className="font-utility space-y-1.5 text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(246,239,223,0.55)" }}>
            <p>Bookings settled locally in Eritrea</p>
            <p>All hotel rates quoted in USD</p>
            <button className="underline" style={{ color: "rgba(246,239,223,0.4)" }}>Partner &amp; admin access</button>
          </div>
        </div>
        <div className="font-utility mt-10 flex flex-col gap-2 border-t pt-5 text-[10px] uppercase tracking-[0.2em] sm:flex-row sm:justify-between" style={{ borderColor: "rgba(246,239,223,0.15)", color: "rgba(246,239,223,0.4)" }}>
          <span>© {new Date().getFullYear()} eritreantourism.com</span>
          <span>Photography placeholders pending licensed images</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- root ---------- */

export default function App() {
  const [drawer, setDrawer] = useState(false);
  return (
    <div className="font-body min-h-screen" style={{ background: T.paper }}>
      <style>{FONT_CSS}</style>
      <Header onMenu={() => setDrawer(true)} />
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
      <Hero />
      <ExploreRail />
      <AsmaraFeature />
      <Stay />
      <Directory />
      <Footer />
    </div>
  );
}
