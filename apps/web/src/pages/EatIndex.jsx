import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, MapPin } from "lucide-react";
import { fetchRestaurants } from "../features/restaurants/api";
import { INK, PLASTER, PLASTER_DIM, PETROL, OCHRE_DEEP, CARD_BORDER, imgUrl } from "../lib/theme";

/**
 * EatIndex — /eat. Directory listing of restaurants. This is a platform
 * surface (immutable rule #1 in CLAUDE.md), so it uses the flag palette
 * from lib/theme.js, not any individual restaurant's theme.
 */
export default function EatIndex() {
  const [restaurants, setRestaurants] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchRestaurants()
      .then((rows) => { if (!cancelled) setRestaurants(rows); })
      .catch((err) => { if (!cancelled) setLoadError(err.message || "Failed to load restaurants"); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: PLASTER }}>
      <Helmet>
        <title>Restaurants in Eritrea | Eritrean Tourism</title>
        <meta
          name="description"
          content="Traditional Eritrean kitchens, Red Sea seafood, Italian-Eritrean cafés, and more — restaurants across Asmara, Massawa, and Keren."
        />
        <link rel="canonical" href="https://eritreantourism.com/eat" />
      </Helmet>

      <header className="border-b-2" style={{ borderColor: CARD_BORDER, background: PLASTER }}>
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-1 text-sm font-semibold" style={{ color: PETROL }}>
            <ArrowLeft className="h-4 w-4" /> eritreantourism.com
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: PETROL }}>Eat</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl" style={{ color: INK }}>Restaurants</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-600">
          Traditional Eritrean kitchens, Red Sea seafood, and Asmara's Italian-Eritrean café culture — reserve a table directly, no prepayment needed.
        </p>

        {loadError && (
          <p className="mt-8 text-sm text-red-700">Couldn't load restaurants: {loadError}</p>
        )}
        {!restaurants && !loadError && (
          <p className="mt-8 text-sm text-gray-400">Loading…</p>
        )}
        {restaurants && restaurants.length === 0 && (
          <p className="mt-8 text-sm text-gray-400">No restaurants listed yet.</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants?.map(({ restaurant: r }) => (
            <Link
              key={r.slug}
              to={`/eat/${r.slug}`}
              className="block overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
              style={{ borderColor: CARD_BORDER }}
            >
              <img src={imgUrl(r.slug, 500, 320)} alt={r.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="text-base font-bold" style={{ color: INK }}>{r.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" /> {r.city} · {r.cuisine}
                </p>
                <p className="mt-2 text-xs text-gray-500">{r.tagline}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide" style={{ color: OCHRE_DEEP }}>
                  View menu &amp; reserve
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{ background: PLASTER_DIM, borderTop: `2px solid ${INK}` }}>
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-gray-500 sm:px-8">
          Part of eritreantourism.com — reservation requests are confirmed directly by each restaurant.
        </div>
      </footer>
    </div>
  );
}
