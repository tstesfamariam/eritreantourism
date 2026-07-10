import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { fetchRestaurantBySlug } from "../features/restaurants/api";
import { getTheme } from "../features/restaurants/themes";
import { generateJsonLd, buildPageTitle, buildMetaDescription } from "../features/restaurants/seo";
import RestaurantSite from "../features/restaurants/RestaurantSite";
import { PLASTER, INK } from "../lib/theme";

/**
 * RestaurantPage — /eat/:slug. Fetches the listing by slug, then hands the
 * config + theme to the RestaurantSite engine. Unknown slugs redirect to
 * /eat rather than showing a bare error (matches the plan's 404 handling).
 */
export default function RestaurantPage() {
  const { slug } = useParams();
  const [result, setResult] = useState(undefined); // undefined = loading, null = not found
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setResult(undefined);
    fetchRestaurantBySlug(slug)
      .then((r) => { if (!cancelled) setResult(r); })
      .catch((err) => { if (!cancelled) setLoadError(err.message || "Failed to load restaurant"); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-sm text-red-700">
        Couldn't load this restaurant: {loadError}
      </div>
    );
  }

  if (result === undefined) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400" style={{ background: PLASTER }}>
        Loading…
      </div>
    );
  }

  if (result === null) {
    return <Navigate to="/eat" replace />;
  }

  const { restaurant, themeId } = result;
  const theme = getTheme(themeId);

  return (
    <>
      <Helmet>
        <title>{buildPageTitle(restaurant)}</title>
        <meta name="description" content={buildMetaDescription(restaurant)} />
        {restaurant.is_seed && <meta name="robots" content="noindex, nofollow" />}
        <link rel="canonical" href={`https://eritreantourism.com/eat/${restaurant.slug}`} />
        <meta property="og:title" content={buildPageTitle(restaurant)} />
        <meta property="og:description" content={buildMetaDescription(restaurant)} />
        <meta property="og:type" content="restaurant.menu" />
        <meta property="og:url" content={`https://eritreantourism.com/eat/${restaurant.slug}`} />
        {restaurant.gallery?.[0]?.image_url && <meta property="og:image" content={restaurant.gallery[0].image_url} />}
        <script type="application/ld+json">{JSON.stringify(generateJsonLd(restaurant))}</script>
      </Helmet>

      <div style={{ padding: "10px 24px", background: INK }}>
        <Link to="/eat" className="flex w-fit items-center gap-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "#EDF2F7" }}>
          <ArrowLeft className="h-3.5 w-3.5" /> All restaurants
        </Link>
      </div>
      <RestaurantSite restaurant={restaurant} theme={theme} />
    </>
  );
}
