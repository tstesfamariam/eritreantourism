import Nav from "./sections/Nav";
import Hero from "./sections/Hero";
import Signatures from "./sections/Signatures";
import Menu from "./sections/Menu";
import Story from "./sections/Story";
import Gallery from "./sections/Gallery";
import Reserve from "./sections/Reserve";
import Visit from "./sections/Visit";
import Footer from "./sections/Footer";
import { texStyle } from "./styleHelpers";

/**
 * RestaurantSite — the one engine. Composes sections from a restaurant
 * config (site_config on the listing) and a theme preset (themes.js).
 * Never fork this into a per-restaurant copy — new restaurants are new
 * data, not new code (immutable rule #3 in CLAUDE.md).
 */
export default function RestaurantSite({ restaurant, theme }) {
  return (
    <div style={{ background: theme.bg, color: theme.ink, fontFamily: `'${theme.body}', sans-serif`, minHeight: "100%", ...texStyle(theme) }}>
      <Nav restaurant={restaurant} theme={theme} />
      <Hero restaurant={restaurant} theme={theme} />
      <Signatures restaurant={restaurant} theme={theme} />
      <Menu restaurant={restaurant} theme={theme} />
      <Story restaurant={restaurant} theme={theme} />
      <Gallery restaurant={restaurant} theme={theme} />
      <Reserve restaurant={restaurant} theme={theme} />
      <Visit restaurant={restaurant} theme={theme} />
      <Footer restaurant={restaurant} theme={theme} />
    </div>
  );
}
