/**
 * theme.js — platform brand tokens (immutable rule #1 in CLAUDE.md): the
 * Eritrean flag palette used on the platform's own surfaces (nav, directory
 * pages, checkout). Per-restaurant pages use their own theme from
 * features/restaurants/themes.js instead — never this file.
 *
 * Extracted from App.jsx so new routed pages (pages/EatIndex.jsx,
 * pages/RestaurantPage.jsx) can share the same brand identity instead of
 * redefining it.
 */

export const INK = "#123A2B";        // highland green ink (structural dark)
export const GREEN = "#2F7C52";      // living green — "live" markers, growth
export const GREEN_DEEP = "#1A5038";
export const PLASTER = "#F6F0E0";    // sun-bleached plaster (heritage neutral)
export const PLASTER_DIM = "#ECE5CF";
export const PETROL = "#1F5673";     // Red Sea blue
export const PETROL_DEEP = "#143D52";
export const OCHRE = "#D9A22E";      // olive-wreath gold
export const OCHRE_DEEP = "#B27F14";
export const ROSE = "#B5342A";       // independence red — used with intent
export const SAGE = GREEN;           // legacy alias (confirmation borders)
export const CARD_BORDER = "#D6CFB4";

export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders:opsz,wght@10..72,400;10..72,600;10..72,800&family=Archivo:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500&display=swap');
.font-display { font-family: 'Big Shoulders', sans-serif; }
.font-body { font-family: 'Archivo', sans-serif; }
.font-utility { font-family: 'Space Grotesk', monospace; }
.duotone { filter: grayscale(1) contrast(1.05) brightness(0.95); }
.poster-card:hover .poster-img { transform: scale(1.04); }
.poster-img { transition: transform .6s ease; }
::selection { background: ${OCHRE}; color: ${INK}; }
`;

export const imgUrl = (seed, w = 800, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
