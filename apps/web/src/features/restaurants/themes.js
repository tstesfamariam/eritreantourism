/**
 * themes.js — the 25 restaurant theme presets.
 * Each theme is everything visual: palette, type pairing, and structural
 * variants (hero / menu / nav layout). Selected per listing via
 * listings.theme_id (see db/migrations/001_init_schema.sql + the
 * upcoming restaurants-vertical migration).
 *
 * hero: full | split | stacked | banner | frame
 * menu: leader | cards | editorial | minimal
 * nav:  inline | center | split
 */
export const THEMES = [
  { id: "enda-mama", name: "Enda Mama", mood: "Traditional coffee-ceremony warmth", bg: "#2B1D14", surface: "#3A2A1E", ink: "#F3E9DC", muted: "#C9B49A", accent: "#D9A441", accent2: "#8C3B2E", display: "Fraunces", body: "Karla", hero: "full", menu: "leader", nav: "inline", radius: 4, texture: "none", dark: true },
  { id: "red-sea", name: "Red Sea", mood: "Coastal seafood, bright and saline", bg: "#F2F7F7", surface: "#FFFFFF", ink: "#0E2A33", muted: "#5A7784", accent: "#0E7490", accent2: "#E4B363", display: "Playfair Display", body: "Inter", hero: "split", menu: "editorial", nav: "split", radius: 10, texture: "none", dark: false },
  { id: "cinema-roma", name: "Cinema Roma", mood: "Asmara's Italian legacy, trattoria classicism", bg: "#FAF6EF", surface: "#FFFFFF", ink: "#23201B", muted: "#7A7162", accent: "#7A1E1E", accent2: "#2F5233", display: "Cormorant Garamond", body: "Manrope", hero: "banner", menu: "leader", nav: "center", radius: 2, texture: "lines", dark: false },
  { id: "neon-nights", name: "Neon Nights", mood: "Late-night grill, electric and loud", bg: "#0C0C10", surface: "#17171E", ink: "#F5F5F7", muted: "#9A9AA6", accent: "#FF4D6D", accent2: "#FFB020", display: "Space Grotesk", body: "Inter", hero: "full", menu: "cards", nav: "split", radius: 14, texture: "dots", dark: true },
  { id: "macchiato", name: "Macchiato", mood: "Asmara café culture, milk-and-espresso tones", bg: "#EFE6DA", surface: "#F8F2E9", ink: "#33261B", muted: "#8A7360", accent: "#6F4E37", accent2: "#C08552", display: "Bitter", body: "Karla", hero: "stacked", menu: "minimal", nav: "center", radius: 8, texture: "none", dark: false },
  { id: "highland", name: "Highland Green", mood: "Plateau vegetarian, fresh and herbal", bg: "#F3F6EF", surface: "#FFFFFF", ink: "#22301F", muted: "#66755F", accent: "#3E6B34", accent2: "#B98B3E", display: "Sora", body: "Inter", hero: "split", menu: "cards", nav: "inline", radius: 16, texture: "none", dark: false },
  { id: "sahel", name: "Sahel", mood: "Desert grill, ember and sand", bg: "#FBF3E4", surface: "#FFFFFF", ink: "#3A2F23", muted: "#8C7A62", accent: "#C97B2D", accent2: "#46604D", display: "Archivo", body: "Manrope", hero: "banner", menu: "leader", nav: "inline", radius: 6, texture: "none", dark: false },
  { id: "port-massawa", name: "Port Massawa", mood: "Harbor-front dining, navy and brass", bg: "#10233A", surface: "#1A3450", ink: "#EDF2F7", muted: "#9FB3C8", accent: "#6FB3C8", accent2: "#D9B36C", display: "Playfair Display", body: "Karla", hero: "full", menu: "editorial", nav: "center", radius: 6, texture: "none", dark: true },
  { id: "tukul", name: "Tukul", mood: "Rustic countryside, wood and clay", bg: "#EFE9DF", surface: "#F7F3EB", ink: "#2C2620", muted: "#7C7263", accent: "#7D5A3C", accent2: "#40513B", display: "Libre Baskerville", body: "Inter", hero: "frame", menu: "leader", nav: "center", radius: 0, texture: "lines", dark: false },
  { id: "fiori", name: "Fiori", mood: "Pastry & gelato, soft and sweet", bg: "#FFF7F5", surface: "#FFFFFF", ink: "#402A32", muted: "#96707D", accent: "#D26A8A", accent2: "#7A9E7E", display: "DM Serif Display", body: "Manrope", hero: "stacked", menu: "minimal", nav: "center", radius: 20, texture: "dots", dark: false },
  { id: "blackline", name: "Blackline", mood: "Fine dining, monochrome and gold", bg: "#101010", surface: "#1B1B1B", ink: "#EDEDED", muted: "#9B9B9B", accent: "#C9A227", accent2: "#6E6E6E", display: "Cormorant Garamond", body: "Archivo", hero: "full", menu: "minimal", nav: "split", radius: 0, texture: "none", dark: true },
  { id: "citrus", name: "Citrus Court", mood: "Juice bar, sun-washed and zesty", bg: "#FFFBEB", surface: "#FFFFFF", ink: "#3A3A1E", muted: "#8A8A5E", accent: "#E08E0B", accent2: "#4C9A2A", display: "Sora", body: "Inter", hero: "split", menu: "cards", nav: "inline", radius: 22, texture: "dots", dark: false },
  { id: "tessera", name: "Tessera", mood: "Modern fusion, geometric and confident", bg: "#F4F4F6", surface: "#FFFFFF", ink: "#17171C", muted: "#6B6B76", accent: "#4338CA", accent2: "#E5484D", display: "Space Grotesk", body: "Manrope", hero: "banner", menu: "cards", nav: "split", radius: 8, texture: "none", dark: false },
  { id: "berbere", name: "Berbere", mood: "Spice-forward, deep crimson heat", bg: "#F8EFEA", surface: "#FFFFFF", ink: "#3B1F1A", muted: "#8C625A", accent: "#A62C2B", accent2: "#D98E32", display: "Fraunces", body: "Manrope", hero: "banner", menu: "leader", nav: "inline", radius: 6, texture: "none", dark: false },
  { id: "liberation", name: "Liberation", mood: "Tricolor pride — green, red, blue", bg: "#FCFCFA", surface: "#FFFFFF", ink: "#1C2321", muted: "#68716D", accent: "#217A4B", accent2: "#B3242A", display: "Archivo", body: "Inter", hero: "split", menu: "editorial", nav: "split", radius: 4, texture: "lines", dark: false },
  { id: "dahlak", name: "Dahlak", mood: "Island escape, coral and lagoon", bg: "#EFF9F7", surface: "#FFFFFF", ink: "#123B3A", muted: "#5E8583", accent: "#0F8C7E", accent2: "#F0755A", display: "DM Serif Display", body: "Karla", hero: "full", menu: "cards", nav: "center", radius: 18, texture: "none", dark: false },
  { id: "shuq", name: "Shuq", mood: "Market energy, paper and stamp-ink", bg: "#F6F2E7", surface: "#FDFBF4", ink: "#26241E", muted: "#77735F", accent: "#1F4E79", accent2: "#C4432B", display: "Space Grotesk", body: "Karla", hero: "frame", menu: "editorial", nav: "inline", radius: 2, texture: "lines", dark: false },
  { id: "amber-hour", name: "Amber Hour", mood: "Wine bar, dusk and candlelight", bg: "#221A1E", surface: "#2E2329", ink: "#F1E7E4", muted: "#B29AA0", accent: "#D08C60", accent2: "#8E4162", display: "Playfair Display", body: "Manrope", hero: "stacked", menu: "minimal", nav: "center", radius: 10, texture: "none", dark: true },
  { id: "keren-bloom", name: "Keren Bloom", mood: "Garden terrace, floral and airy", bg: "#F7F9F3", surface: "#FFFFFF", ink: "#2E3A2C", muted: "#75846F", accent: "#5B8C51", accent2: "#C97BA0", display: "Cormorant Garamond", body: "Inter", hero: "stacked", menu: "leader", nav: "center", radius: 14, texture: "dots", dark: false },
  { id: "steel-steam", name: "Steel & Steam", mood: "Industrial brewhouse, iron and copper", bg: "#1D1F21", surface: "#282B2E", ink: "#ECECEA", muted: "#A2A6A8", accent: "#C77B3F", accent2: "#7FA3B0", display: "Archivo", body: "Inter", hero: "banner", menu: "cards", nav: "split", radius: 4, texture: "lines", dark: true },
  { id: "sycamore", name: "Sycamore", mood: "Slow food, earth and bark", bg: "#F1EDE4", surface: "#FAF7F0", ink: "#33312A", muted: "#807B6C", accent: "#5C6B3C", accent2: "#9E7649", display: "Fraunces", body: "Inter", hero: "frame", menu: "minimal", nav: "inline", radius: 8, texture: "none", dark: false },
  { id: "asmarina", name: "Asmarina", mood: "Art-deco modernism, ivory and jade", bg: "#F5F4EF", surface: "#FFFFFF", ink: "#1E2826", muted: "#6E7A76", accent: "#1F6E5E", accent2: "#C2A14D", display: "DM Serif Display", body: "Archivo", hero: "banner", menu: "editorial", nav: "center", radius: 0, texture: "lines", dark: false },
  { id: "zigni-house", name: "Zigni House", mood: "Family table, generous and bold", bg: "#FFF6EC", surface: "#FFFFFF", ink: "#41210F", muted: "#8F6A50", accent: "#B4451F", accent2: "#3D6B45", display: "Bitter", body: "Manrope", hero: "full", menu: "cards", nav: "inline", radius: 12, texture: "none", dark: false },
  { id: "midnight-tea", name: "Midnight Tea", mood: "Tea house, indigo calm", bg: "#171A2B", surface: "#222641", ink: "#EDEDF5", muted: "#A4A8C4", accent: "#8B93E8", accent2: "#D9A441", display: "Libre Baskerville", body: "Karla", hero: "stacked", menu: "leader", nav: "center", radius: 12, texture: "dots", dark: true },
  { id: "salt-flat", name: "Salt Flat", mood: "Danakil minimalism, white heat", bg: "#FDFDFB", surface: "#F4F4EF", ink: "#20201C", muted: "#82827A", accent: "#D4522A", accent2: "#1E1E1A", display: "Space Grotesk", body: "Inter", hero: "frame", menu: "minimal", nav: "split", radius: 0, texture: "none", dark: false },
];

const DEFAULT_THEME_ID = "enda-mama";

export function getTheme(themeId) {
  return (
    THEMES.find((t) => t.id === themeId) ||
    THEMES.find((t) => t.id === DEFAULT_THEME_ID) ||
    THEMES[0]
  );
}
