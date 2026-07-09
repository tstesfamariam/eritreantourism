import { useState, useMemo } from "react";

/* ================================================================
   ERITREAN TOURISM — RESTAURANT TEMPLATE ENGINE
   One engine. 25 theme presets. Infinite restaurants.

   Architecture:
   - RESTAURANT CONFIG (JSON): everything content — name, story,
     menu, hours, location. In production this lives in Supabase
     (listings.metadata) and is fetched by slug.
   - THEME PRESET: everything visual — palette, type pairing, and
     structural variants (hero / menu / nav layout). Stored as
     theme_id on the listing.
   - SEO: generateJsonLd() emits schema.org Restaurant markup;
     in production, render it into <head> along with per-page
     title/description from the config.
   ================================================================ */

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Playfair+Display:wght@500;700&family=Cormorant+Garamond:wght@500;600;700&family=Libre+Baskerville:wght@400;700&family=DM+Serif+Display&family=Bitter:wght@500;700&family=Space+Grotesk:wght@400;500;700&family=Sora:wght@400;600;700&family=Archivo:wght@500;700;800&family=Manrope:wght@400;500;700&family=Karla:wght@400;500;700&family=Inter:wght@400;500;600&display=swap');
`;

/* ----------------------------------------------------------------
   25 THEME PRESETS
   hero: full | split | stacked | banner | frame
   menu: leader | cards | editorial | minimal
   nav:  inline | center | split
---------------------------------------------------------------- */
const THEMES = [
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

/* ----------------------------------------------------------------
   SAMPLE RESTAURANT CONFIGS
   In production: SELECT metadata FROM listings WHERE slug = $1
---------------------------------------------------------------- */
const RESTAURANTS = [
  {
    slug: "adulis-kitchen",
    name: "Adulis Kitchen",
    tagline: "Traditional Eritrean dining in the heart of Asmara",
    cuisine: "Eritrean · Traditional",
    est: 1987,
    city: "Asmara",
    address: "Harnet Avenue 42, Asmara, Eritrea",
    phone: "+291 1 12 34 56",
    priceRange: "$$",
    story: [
      "For nearly four decades, Adulis Kitchen has served Asmara the way a grandmother serves her family — generously, slowly, and always with fresh injera. Our tsebhi simmers for hours over low heat, and our berbere is ground in-house every week.",
      "Every meal ends the traditional way: a full coffee ceremony, beans roasted at your table, three rounds poured, no one in a hurry.",
    ],
    signatures: ["Zigni Beef", "Tsebhi Dorho", "Shiro", "Coffee Ceremony"],
    menu: [
      { section: "Traditional Plates", items: [
        { name: "Zigni", desc: "Slow-simmered beef in berbere sauce, served on injera", price: 9 },
        { name: "Tsebhi Dorho", desc: "Chicken stew with hard-boiled egg and clarified butter", price: 10 },
        { name: "Shiro", desc: "Silky chickpea purée with garlic and toasted spices", price: 7 },
        { name: "Alicha Birsen", desc: "Mild lentil curry with turmeric and ginger", price: 7 },
      ]},
      { section: "To Share", items: [
        { name: "Beyaynetu", desc: "Grand vegetarian platter — five stews on injera for two", price: 16 },
        { name: "Kitcha Fit-fit", desc: "Torn flatbread tossed in spiced butter and yogurt", price: 6 },
      ]},
      { section: "To Finish", items: [
        { name: "Coffee Ceremony", desc: "Beans roasted tableside, three traditional rounds", price: 5 },
        { name: "Himbasha", desc: "Sweet celebration bread with cardamom", price: 4 },
      ]},
    ],
    hours: [
      ["Mon – Thu", "11:00 – 22:00"],
      ["Fri – Sat", "11:00 – 23:30"],
      ["Sunday", "12:00 – 21:00"],
    ],
    gallery: [
      { label: "The dining room", tone: "a" },
      { label: "Injera, made daily", tone: "b" },
      { label: "Coffee ceremony", tone: "c" },
      { label: "The courtyard", tone: "d" },
    ],
  },
  {
    slug: "marea-massawa",
    name: "Marea",
    tagline: "The Red Sea, straight to your table",
    cuisine: "Seafood · Coastal",
    est: 2015,
    city: "Massawa",
    address: "Old Port Road 7, Massawa, Eritrea",
    phone: "+291 1 55 22 10",
    priceRange: "$$$",
    story: [
      "Marea sits on the old port of Massawa, where our fishermen dock each morning. What they bring is what we cook — grilled whole over charcoal, dressed with lime, cumin, and nothing that hides the sea.",
      "Come at sunset. The terrace faces west across the harbor, and the grilled prawns taste better with the sky on fire.",
    ],
    signatures: ["Charcoal Whole Fish", "Harbor Prawns", "Octopus Salad"],
    menu: [
      { section: "From the Grill", items: [
        { name: "Whole Red Snapper", desc: "Charcoal-grilled, lime, cumin butter, flatbread", price: 18 },
        { name: "Harbor Prawns", desc: "Half kilo, garlic-chili glaze, charred lemon", price: 16 },
        { name: "Kingfish Steak", desc: "Thick-cut, green pepper sauce", price: 15 },
      ]},
      { section: "Cold & Fresh", items: [
        { name: "Octopus Salad", desc: "Tender octopus, red onion, parsley, olive oil", price: 11 },
        { name: "Catch Crudo", desc: "Today's fish, raw, citrus and sea salt", price: 12 },
      ]},
      { section: "Sides", items: [
        { name: "Saffron Rice", desc: "With toasted almonds", price: 5 },
        { name: "Grilled Vegetables", desc: "Market vegetables, charcoal-kissed", price: 5 },
      ]},
    ],
    hours: [
      ["Tue – Sun", "12:00 – 23:00"],
      ["Monday", "Closed"],
    ],
    gallery: [
      { label: "Sunset terrace", tone: "a" },
      { label: "Morning catch", tone: "b" },
      { label: "The charcoal grill", tone: "c" },
      { label: "Old port views", tone: "d" },
    ],
  },
  {
    slug: "bar-vittoria",
    name: "Bar Vittoria",
    tagline: "Espresso, pasticceria & aperitivo since 1938",
    cuisine: "Café · Italian-Eritrean",
    est: 1938,
    city: "Asmara",
    address: "Liberation Avenue 15, Asmara, Eritrea",
    phone: "+291 1 20 11 88",
    priceRange: "$",
    story: [
      "Bar Vittoria has poured espresso under the same art-deco ceiling since 1938. The machine is Italian, the beans are Eritrean highland, and the recipe for our cornetti hasn't changed in three generations.",
      "Mornings are for macchiato and the newspaper. Evenings, the terrace fills for aperitivo as Liberation Avenue takes its nightly stroll.",
    ],
    signatures: ["Macchiato", "Cornetto", "Panettone", "Aperitivo Hour"],
    menu: [
      { section: "Caffè", items: [
        { name: "Macchiato", desc: "The Asmara classic — espresso stained with foam", price: 1.5 },
        { name: "Cappuccino", desc: "Highland beans, steamed milk", price: 2 },
        { name: "Espresso", desc: "Short, dark, perfect", price: 1 },
      ]},
      { section: "Pasticceria", items: [
        { name: "Cornetto", desc: "Baked at dawn — plain, jam, or cream", price: 1.5 },
        { name: "Sfogliatella", desc: "Crisp layered pastry, ricotta and citrus", price: 2.5 },
        { name: "Torta della Nonna", desc: "Custard tart with pine nuts", price: 3 },
      ]},
      { section: "Aperitivo", items: [
        { name: "House Spritz", desc: "With olives, chips, and small bites", price: 4 },
        { name: "Panini Board", desc: "Three small panini for the table", price: 6 },
      ]},
    ],
    hours: [
      ["Every day", "06:30 – 22:00"],
    ],
    gallery: [
      { label: "The deco ceiling", tone: "a" },
      { label: "Morning pastry case", tone: "b" },
      { label: "Terrace at dusk", tone: "c" },
      { label: "The 1938 machine", tone: "d" },
    ],
  },
  {
    slug: "ghenet-garden",
    name: "Ghenet Garden",
    tagline: "Highland vegetarian cooking, from garden to injera",
    cuisine: "Eritrean · Vegetarian",
    est: 2009,
    city: "Asmara",
    address: "Sematat Avenue 88, Asmara, Eritrea",
    phone: "+291 1 18 40 22",
    priceRange: "$",
    story: [
      "Ghenet Garden grew out of fasting-day cooking — the Wednesdays and Fridays when Asmara's kitchens go meatless and, many say, taste their best. We took those dishes and gave them a home of their own, with vegetables from farms just outside the city.",
      "Our courtyard tables sit under an old fig tree. Order the beyaynetu, share it, and take your time.",
    ],
    signatures: ["Beyaynetu", "Shiro Tegamino", "Hamli", "Fresh Juices"],
    menu: [
      { section: "Fasting Plates", items: [
        { name: "Beyaynetu", desc: "The full spread — six vegetable stews on fresh injera", price: 8 },
        { name: "Shiro Tegamino", desc: "Chickpea stew served bubbling in a clay pot", price: 6 },
        { name: "Hamli", desc: "Collard greens sautéed with garlic and green chili", price: 5 },
        { name: "Duba", desc: "Sweet pumpkin stew with ginger and turmeric", price: 5 },
      ]},
      { section: "From the Garden", items: [
        { name: "Timtimo", desc: "Spiced red lentils, slow-cooked", price: 5 },
        { name: "Garden Salad", desc: "Tomato, onion, jalapeño, lime — sharp and cold", price: 4 },
      ]},
      { section: "Juices & More", items: [
        { name: "Spris", desc: "Layered avocado, mango, and papaya juice", price: 3 },
        { name: "Ginger Lemonade", desc: "Pressed daily, barely sweet", price: 2.5 },
      ]},
    ],
    hours: [
      ["Mon – Sat", "10:00 – 21:30"],
      ["Sunday", "11:00 – 20:00"],
    ],
    gallery: [
      { label: "The fig-tree courtyard", tone: "a" },
      { label: "Beyaynetu for two", tone: "b" },
      { label: "Morning vegetable delivery", tone: "c" },
      { label: "Shiro in the clay pot", tone: "d" },
    ],
  },
  {
    slug: "dolce-asmara",
    name: "Dolce Asmara",
    tagline: "Gelato & pasticceria on Harnet Avenue",
    cuisine: "Gelateria · Pastry",
    est: 1996,
    city: "Asmara",
    address: "Harnet Avenue 103, Asmara, Eritrea",
    phone: "+291 1 12 77 09",
    priceRange: "$",
    story: [
      "Dolce Asmara churns gelato the old way — small batches, every morning, in machines that came from Italy long before we did. Highland milk makes it richer; the afternoon passeggiata makes it necessary.",
      "The counter is first come, first served. The smile is free.",
    ],
    signatures: ["Pistachio Gelato", "Cassata", "Zabaglione", "Affogato"],
    menu: [
      { section: "Gelato", items: [
        { name: "Pistachio", desc: "The house pride — toasted, never too sweet", price: 1.5 },
        { name: "Highland Cream", desc: "Fior di latte from Asmara dairy", price: 1.5 },
        { name: "Mango & Papaya", desc: "Made from lowland fruit, dairy-free", price: 1.5 },
        { name: "Affogato", desc: "Two scoops drowned in hot espresso", price: 2.5 },
      ]},
      { section: "Pasticceria", items: [
        { name: "Cassata", desc: "Sicilian layered sponge with ricotta and candied fruit", price: 3 },
        { name: "Cannoli", desc: "Filled to order so the shell stays crisp", price: 2 },
        { name: "Zabaglione", desc: "Warm whipped custard, Sunday afternoons only", price: 3 },
      ]},
      { section: "To Drink", items: [
        { name: "Macchiato", desc: "The Asmara standard", price: 1 },
        { name: "Granita", desc: "Lemon or coffee, crushed ice", price: 2 },
      ]},
    ],
    hours: [
      ["Every day", "09:00 – 22:00"],
    ],
    gallery: [
      { label: "The gelato counter", tone: "a" },
      { label: "Cassata, sliced", tone: "b" },
      { label: "Passeggiata hour", tone: "c" },
      { label: "The original machines", tone: "d" },
    ],
  },
  {
    slug: "mai-jahjah-grill",
    name: "Mai Jah Jah Grill",
    tagline: "Charcoal, smoke, and late nights by the fountain",
    cuisine: "Grill · Eritrean",
    est: 2018,
    city: "Asmara",
    address: "Mai Jah Jah District, Asmara, Eritrea",
    phone: "+291 1 15 63 30",
    priceRange: "$$",
    story: [
      "Mai Jah Jah Grill does one thing: meat over charcoal, seasoned hard, served hot. The grill runs from noon until the coals die, and on weekends that's well past midnight.",
      "No reservations needed for the terrace — but the private mezzanine books out fast on Fridays.",
    ],
    signatures: ["Lamb Tibsi", "Kwanta Firfir", "Mixed Grill Board"],
    menu: [
      { section: "Over Charcoal", items: [
        { name: "Lamb Tibsi", desc: "Cubed lamb flash-seared with rosemary and jalapeño", price: 11 },
        { name: "Mixed Grill Board", desc: "Lamb, beef, and chicken for two, with injera and bread", price: 20 },
        { name: "Half Chicken", desc: "Berbere-rubbed, grilled slow", price: 9 },
      ]},
      { section: "House Classics", items: [
        { name: "Kwanta Firfir", desc: "Dried spiced beef tossed with torn injera and butter", price: 8 },
        { name: "Zilzil", desc: "Long-cut beef strips, crisp edges, soft center", price: 10 },
      ]},
      { section: "Sides", items: [
        { name: "Grilled Corn", desc: "Charred, lime, chili salt", price: 3 },
        { name: "House Bread", desc: "Baked in the coal oven", price: 2 },
      ]},
    ],
    hours: [
      ["Sun – Thu", "12:00 – 23:00"],
      ["Fri – Sat", "12:00 – 01:00"],
    ],
    gallery: [
      { label: "The coal bed", tone: "a" },
      { label: "Mixed grill board", tone: "b" },
      { label: "Terrace at night", tone: "c" },
      { label: "The mezzanine", tone: "d" },
    ],
  },
  {
    slug: "keren-terrace",
    name: "Keren Terrace",
    tagline: "Garden dining under the bougainvillea",
    cuisine: "Eritrean · Garden Café",
    est: 2012,
    city: "Keren",
    address: "Giro Fiori Road 5, Keren, Eritrea",
    phone: "+291 1 40 12 84",
    priceRange: "$",
    story: [
      "Keren is Eritrea's garden city, and Keren Terrace is its table. We cook with what the surrounding orchards bring in — pomegranates, citrus, prickly pear in season — under a canopy of bougainvillea that blooms most of the year.",
      "Come in the late afternoon when the heat lifts off the valley and the light turns gold.",
    ],
    signatures: ["Fruit of the Day", "Chicken Alicha", "Pomegranate Juice"],
    menu: [
      { section: "From the Kitchen", items: [
        { name: "Chicken Alicha", desc: "Mild turmeric chicken stew, gentle and golden", price: 8 },
        { name: "Vegetable Beyaynetu", desc: "Garden stews on injera, changes daily", price: 7 },
        { name: "Shahan Ful", desc: "Mashed fava beans with tomato, chili, and warm bread", price: 4 },
      ]},
      { section: "From the Orchards", items: [
        { name: "Fruit of the Day", desc: "Whatever Keren's orchards sent this morning", price: 3 },
        { name: "Prickly Pear Plate", desc: "Peeled and chilled, in season (Jul–Sep)", price: 3 },
      ]},
      { section: "To Drink", items: [
        { name: "Pomegranate Juice", desc: "Pressed to order", price: 2.5 },
        { name: "Shahi", desc: "Spiced black tea, Keren style", price: 1 },
      ]},
    ],
    hours: [
      ["Every day", "08:00 – 21:00"],
    ],
    gallery: [
      { label: "Under the bougainvillea", tone: "a" },
      { label: "Morning orchard haul", tone: "b" },
      { label: "Golden hour on the terrace", tone: "c" },
      { label: "Shahi service", tone: "d" },
    ],
  },
  {
    slug: "enda-silka",
    name: "Enda Silka",
    tagline: "Keren breakfast house — ful, silsi, and strong tea",
    cuisine: "Eritrean · Breakfast House",
    est: 1981,
    city: "Keren",
    address: "Market Square 12, Keren, Eritrea",
    phone: "+291 1 40 08 51",
    priceRange: "$",
    story: [
      "Enda Silka opens before the Monday camel market does, and has for over forty years. Keren eats breakfast seriously — ful mashed at the table, silsi hot enough to wake you, bread straight from the oven next door.",
      "Traders, drivers, and families share the long tables. You will too.",
    ],
    signatures: ["Shahan Ful", "Silsi", "Ga'at", "Market-Day Breakfast"],
    menu: [
      { section: "Breakfast", items: [
        { name: "Shahan Ful", desc: "Fava beans mashed tableside with oil, chili, onion, egg", price: 3.5 },
        { name: "Silsi", desc: "Fiery tomato-berbere sauce with torn bread for dipping", price: 3 },
        { name: "Ga'at", desc: "Barley porridge with a well of spiced butter and yogurt", price: 4 },
        { name: "Frittata", desc: "Eggs scrambled with tomato, onion, and green pepper", price: 3.5 },
      ]},
      { section: "Market-Day Extras", items: [
        { name: "Fata", desc: "Bread soaked in spiced yogurt sauce — Monday special", price: 4 },
        { name: "Liver Tibsi", desc: "Quick-fried, onions and chili", price: 5 },
      ]},
      { section: "To Drink", items: [
        { name: "Shahi Adey", desc: "Sweet spiced tea, the Keren way", price: 0.5 },
        { name: "Bun", desc: "Coffee, roasted in the back room", price: 1 },
      ]},
    ],
    hours: [
      ["Mon – Sat", "05:30 – 14:00"],
      ["Sunday", "06:30 – 12:00"],
    ],
    gallery: [
      { label: "The long tables", tone: "a" },
      { label: "Ful, mashed to order", tone: "b" },
      { label: "Market morning rush", tone: "c" },
      { label: "The tea kettles", tone: "d" },
    ],
  },
  {
    slug: "taulud-fish-house",
    name: "Taulud Fish House",
    tagline: "Pick your catch, we bake it in the clay oven",
    cuisine: "Seafood · Massawa Style",
    est: 1994,
    city: "Massawa",
    address: "Taulud Causeway 3, Massawa, Eritrea",
    phone: "+291 1 55 09 47",
    priceRange: "$$",
    story: [
      "At Taulud Fish House there is no menu in the usual sense — there is a bed of ice with this morning's catch on it. You point, we weigh, and the fish goes into the clay oven Massawa-style: slashed, rubbed with berbere, and pressed against the hot oven wall until the skin crackles.",
      "It comes to the table whole, with hot flatbread and our green chili sauce. Eat with your hands. Everyone does.",
    ],
    signatures: ["Clay-Oven Fish", "Berbere Prawns", "Green Chili Sauce"],
    menu: [
      { section: "From the Oven", items: [
        { name: "Clay-Oven Fish", desc: "Today's whole fish, berbere crust, baked on the oven wall — priced by weight from", price: 12 },
        { name: "Berbere Prawns", desc: "Blistered in the oven's mouth, finished with lime", price: 14 },
        { name: "Oven Flatbread", desc: "Baked to order against the same walls as the fish", price: 2 },
      ]},
      { section: "From the Market", items: [
        { name: "Grilled Calamari", desc: "Charred fast, cumin and garlic oil", price: 10 },
        { name: "Fish Soup", desc: "Head-and-bones broth, tomato, green chili", price: 6 },
      ]},
      { section: "Sides & Sauces", items: [
        { name: "Green Chili Sauce", desc: "The house condiment — ask for extra", price: 1 },
        { name: "Tomato & Onion Salad", desc: "Cold and sharp against the heat", price: 3 },
      ]},
    ],
    hours: [
      ["Every day", "11:00 – 15:00"],
      ["Evenings", "18:00 – 23:30"],
    ],
    gallery: [
      { label: "The morning ice bed", tone: "a" },
      { label: "Fish on the oven wall", tone: "b" },
      { label: "The causeway tables", tone: "c" },
      { label: "Whole fish, served", tone: "d" },
    ],
  },
  {
    slug: "gurgusum-beach-kitchen",
    name: "Gurgusum Beach Kitchen",
    tagline: "Barefoot dining on the Gurgusum shore",
    cuisine: "Beach Grill · Seafood",
    est: 2019,
    city: "Massawa",
    address: "Gurgusum Beach Road, Massawa, Eritrea",
    phone: "+291 1 55 31 26",
    priceRange: "$$",
    story: [
      "Gurgusum Beach Kitchen is a grill, a shade canopy, and thirty steps of sand between your table and the Red Sea. We open when the afternoon heat breaks and cook until the last table leaves — Massawa keeps late hours, and so do we.",
      "Swim first. The kingfish skewers taste better after.",
    ],
    signatures: ["Kingfish Skewers", "Sunset Platter", "Fresh Watermelon Juice"],
    menu: [
      { section: "Beach Grill", items: [
        { name: "Kingfish Skewers", desc: "Cumin-lime marinade, grilled over driftwood coals", price: 10 },
        { name: "Sunset Platter", desc: "Skewers, prawns, and grilled catch for two", price: 22 },
        { name: "Spiced Chicken Wings", desc: "Berbere-honey glaze, charred edges", price: 7 },
      ]},
      { section: "Cold & Fresh", items: [
        { name: "Red Sea Ceviche", desc: "Today's white fish, lime, chili, red onion", price: 9 },
        { name: "Watermelon & Feta", desc: "Ice-cold, mint, black pepper", price: 5 },
      ]},
      { section: "To Drink", items: [
        { name: "Fresh Watermelon Juice", desc: "Pressed by the glass or the jug", price: 2.5 },
        { name: "Mango Shake", desc: "Thick enough to need patience", price: 3 },
        { name: "Shahi", desc: "Hot sweet tea, even on the beach", price: 1 },
      ]},
    ],
    hours: [
      ["Every day", "16:00 – 01:00"],
    ],
    gallery: [
      { label: "Thirty steps to the sea", tone: "a" },
      { label: "Skewers over coals", tone: "b" },
      { label: "Sunset from the canopy", tone: "c" },
      { label: "The jug of watermelon", tone: "d" },
    ],
  },
];

/* ----------------------------------------------------------------
   SEO — schema.org Restaurant JSON-LD
   In production: <script type="application/ld+json"> in <head>,
   plus <title>{name} — {cuisine} in {city} | Eritrean Tourism</title>
---------------------------------------------------------------- */
function generateJsonLd(r) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    description: r.tagline,
    servesCuisine: r.cuisine,
    priceRange: r.priceRange,
    telephone: r.phone,
    foundingDate: String(r.est),
    address: { "@type": "PostalAddress", streetAddress: r.address, addressLocality: r.city, addressCountry: "ER" },
    url: `https://eritreantourism.com/eat/${r.slug}`,
    acceptsReservations: "True",
    hasMenu: `https://eritreantourism.com/eat/${r.slug}#menu`,
  };
}

/* ---------------------------------------------------------------- */
const fmt = (p) => (p % 1 === 0 ? `$${p}` : `$${p.toFixed(2)}`);

function texStyle(t) {
  if (t.texture === "lines")
    return { backgroundImage: `repeating-linear-gradient(0deg, ${t.ink}08 0 1px, transparent 1px 28px)` };
  if (t.texture === "dots")
    return { backgroundImage: `radial-gradient(${t.ink}12 1px, transparent 1px)`, backgroundSize: "22px 22px" };
  return {};
}

function galleryTone(t, tone) {
  const map = {
    a: `linear-gradient(135deg, ${t.accent}, ${t.accent}66)`,
    b: `linear-gradient(135deg, ${t.accent2}, ${t.accent2}66)`,
    c: `linear-gradient(135deg, ${t.accent}AA, ${t.accent2}AA)`,
    d: `linear-gradient(135deg, ${t.ink}CC, ${t.accent}88)`,
  };
  return map[tone] || map.a;
}

/* ============ SECTIONS ============ */

function Nav({ r, t }) {
  const link = { color: t.ink, textDecoration: "none", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, opacity: 0.85 };
  const btn = { background: t.accent, color: t.dark ? t.bg : "#fff", padding: "9px 18px", borderRadius: t.radius, fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", border: "none", cursor: "pointer" };
  const brand = <span style={{ fontFamily: `'${t.display}', serif`, fontSize: 22, fontWeight: 700, color: t.ink }}>{r.name}</span>;
  const links = (
    <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      <a href="#menu" style={link}>Menu</a>
      <a href="#story" style={link}>Our story</a>
      <a href="#visit" style={link}>Visit</a>
    </div>
  );
  if (t.nav === "center")
    return (
      <nav style={{ padding: "20px 24px", textAlign: "center", borderBottom: `1px solid ${t.ink}18` }}>
        <div style={{ marginBottom: 12 }}>{brand}</div>
        <div style={{ display: "flex", gap: 22, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          {links} <a href="#reserve" style={{ ...btn, textDecoration: "none" }}>Reserve a table</a>
        </div>
      </nav>
    );
  return (
    <nav style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderBottom: t.nav === "split" ? `1px solid ${t.ink}18` : "none" }}>
      {brand}
      <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        {links}
        <a href="#reserve" style={{ ...btn, textDecoration: "none" }}>Reserve</a>
      </div>
    </nav>
  );
}

function Hero({ r, t }) {
  const eyebrow = (
    <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700, marginBottom: 16 }}>
      {r.cuisine} · {r.city} · Since {r.est}
    </div>
  );
  const cta = (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
      <a href="#reserve" style={{ background: t.accent, color: t.dark ? t.bg : "#fff", padding: "13px 26px", borderRadius: t.radius, fontWeight: 700, fontSize: 14, textDecoration: "none", letterSpacing: "0.04em" }}>Reserve a table</a>
      <a href="#menu" style={{ border: `2px solid ${t.ink}55`, color: t.ink, padding: "11px 24px", borderRadius: t.radius, fontWeight: 700, fontSize: 14, textDecoration: "none", letterSpacing: "0.04em" }}>See the menu</a>
    </div>
  );
  const title = (size) => (
    <h1 style={{ fontFamily: `'${t.display}', serif`, fontSize: `clamp(38px, 7vw, ${size}px)`, lineHeight: 1.05, margin: 0, color: t.ink, fontWeight: 700 }}>{r.tagline}</h1>
  );

  if (t.hero === "split")
    return (
      <header style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 0, alignItems: "stretch" }}>
        <div style={{ padding: "72px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {eyebrow}{title(58)}
          <p style={{ color: t.muted, fontSize: 17, lineHeight: 1.6, marginTop: 18, maxWidth: 480 }}>{r.story[0].split(".")[0]}.</p>
          {cta}
        </div>
        <div style={{ minHeight: 340, background: galleryTone(t, "c"), display: "flex", alignItems: "flex-end", padding: 24 }}>
          <span style={{ color: "#fff", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.9 }}>{r.gallery[0].label}</span>
        </div>
      </header>
    );

  if (t.hero === "banner")
    return (
      <header style={{ padding: "80px 24px 64px", textAlign: "left", maxWidth: 880, margin: "0 auto" }}>
        {eyebrow}{title(64)}
        <p style={{ color: t.muted, fontSize: 18, lineHeight: 1.65, marginTop: 20, maxWidth: 620 }}>{r.story[0].split(".")[0]}.</p>
        {cta}
      </header>
    );

  if (t.hero === "stacked")
    return (
      <header style={{ padding: "88px 24px 64px", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
        {eyebrow}{title(66)}
        <p style={{ color: t.muted, fontSize: 17, lineHeight: 1.65, marginTop: 20 }}>{r.story[0].split(".")[0]}.</p>
        <div style={{ display: "flex", justifyContent: "center" }}>{cta}</div>
      </header>
    );

  if (t.hero === "frame")
    return (
      <header style={{ padding: "40px 24px" }}>
        <div style={{ border: `2px solid ${t.ink}`, padding: "64px 32px", maxWidth: 900, margin: "0 auto", textAlign: "center", borderRadius: t.radius, background: t.surface }}>
          {eyebrow}{title(60)}
          <p style={{ color: t.muted, fontSize: 17, lineHeight: 1.65, marginTop: 18, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>{r.story[0].split(".")[0]}.</p>
          <div style={{ display: "flex", justifyContent: "center" }}>{cta}</div>
        </div>
      </header>
    );

  // full
  return (
    <header style={{ minHeight: 480, display: "flex", alignItems: "center", background: `linear-gradient(160deg, ${t.bg} 30%, ${t.accent}22 100%)`, padding: "72px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", width: "100%" }}>
        {eyebrow}{title(72)}
        <p style={{ color: t.muted, fontSize: 18, lineHeight: 1.65, marginTop: 20, maxWidth: 560 }}>{r.story[0].split(".")[0]}.</p>
        {cta}
      </div>
    </header>
  );
}

function Signatures({ r, t }) {
  return (
    <div style={{ borderTop: `1px solid ${t.ink}18`, borderBottom: `1px solid ${t.ink}18`, padding: "18px 24px", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {r.signatures.map((s) => (
        <span key={s} style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: t.accent2, padding: "6px 14px", border: `1px solid ${t.accent2}55`, borderRadius: t.radius }}>{s}</span>
      ))}
    </div>
  );
}

function Menu({ r, t }) {
  const heading = (
    <div style={{ textAlign: "center", marginBottom: 40 }}>
      <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700 }}>The menu</div>
      <h2 style={{ fontFamily: `'${t.display}', serif`, fontSize: "clamp(30px, 5vw, 44px)", margin: "8px 0 0", color: t.ink }}>What we cook</h2>
    </div>
  );

  if (t.menu === "cards")
    return (
      <section id="menu" style={{ padding: "72px 24px", maxWidth: 1020, margin: "0 auto" }}>
        {heading}
        {r.menu.map((sec) => (
          <div key={sec.section} style={{ marginBottom: 36 }}>
            <h3 style={{ fontFamily: `'${t.display}', serif`, fontSize: 22, color: t.accent2, margin: "0 0 16px" }}>{sec.section}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {sec.items.map((it) => (
                <div key={it.name} style={{ background: t.surface, borderRadius: t.radius, padding: 20, border: `1px solid ${t.ink}14` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                    <strong style={{ color: t.ink, fontSize: 16 }}>{it.name}</strong>
                    <span style={{ color: t.accent, fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(it.price)}</span>
                  </div>
                  <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.55, margin: "8px 0 0" }}>{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    );

  if (t.menu === "editorial")
    return (
      <section id="menu" style={{ padding: "72px 24px", maxWidth: 980, margin: "0 auto" }}>
        {heading}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
          {r.menu.map((sec) => (
            <div key={sec.section}>
              <h3 style={{ fontFamily: `'${t.display}', serif`, fontSize: 21, color: t.ink, borderBottom: `2px solid ${t.accent}`, paddingBottom: 8, margin: "0 0 18px" }}>{sec.section}</h3>
              {sec.items.map((it) => (
                <div key={it.name} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                    <strong style={{ color: t.ink, fontSize: 15 }}>{it.name}</strong>
                    <span style={{ color: t.accent, fontWeight: 700 }}>{fmt(it.price)}</span>
                  </div>
                  <p style={{ color: t.muted, fontSize: 13.5, lineHeight: 1.5, margin: "4px 0 0" }}>{it.desc}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );

  if (t.menu === "minimal")
    return (
      <section id="menu" style={{ padding: "72px 24px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        {heading}
        {r.menu.map((sec) => (
          <div key={sec.section} style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent2, fontWeight: 700, marginBottom: 18 }}>{sec.section}</div>
            {sec.items.map((it) => (
              <div key={it.name} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: `'${t.display}', serif`, fontSize: 20, color: t.ink }}>{it.name} <span style={{ color: t.accent, fontSize: 16 }}>— {fmt(it.price)}</span></div>
                <p style={{ color: t.muted, fontSize: 14, margin: "4px 0 0", lineHeight: 1.5 }}>{it.desc}</p>
              </div>
            ))}
          </div>
        ))}
      </section>
    );

  // leader (classic dotted list)
  return (
    <section id="menu" style={{ padding: "72px 24px", maxWidth: 720, margin: "0 auto" }}>
      {heading}
      {r.menu.map((sec) => (
        <div key={sec.section} style={{ marginBottom: 36 }}>
          <h3 style={{ fontFamily: `'${t.display}', serif`, fontSize: 22, color: t.accent2, margin: "0 0 16px", textAlign: "center" }}>{sec.section}</h3>
          {sec.items.map((it) => (
            <div key={it.name} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <strong style={{ color: t.ink, fontSize: 16, whiteSpace: "nowrap" }}>{it.name}</strong>
                <span style={{ flex: 1, borderBottom: `1px dotted ${t.muted}88`, transform: "translateY(-4px)" }} />
                <span style={{ color: t.accent, fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(it.price)}</span>
              </div>
              <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.5, margin: "4px 0 0" }}>{it.desc}</p>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

function Story({ r, t }) {
  return (
    <section id="story" style={{ background: t.surface, padding: "72px 24px", borderTop: `1px solid ${t.ink}12`, borderBottom: `1px solid ${t.ink}12` }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 40, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700 }}>Our story</div>
          <h2 style={{ fontFamily: `'${t.display}', serif`, fontSize: "clamp(28px, 4.5vw, 40px)", margin: "10px 0 0", color: t.ink, lineHeight: 1.15 }}>Serving {r.city} since {r.est}</h2>
        </div>
        <div>
          {r.story.map((p, i) => (
            <p key={i} style={{ color: t.muted, fontSize: 16, lineHeight: 1.7, margin: i ? "16px 0 0" : 0 }}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({ r, t }) {
  return (
    <section style={{ padding: "64px 24px", maxWidth: 1020, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {r.gallery.map((g) => (
          <div key={g.label} style={{ height: 190, borderRadius: t.radius, background: galleryTone(t, g.tone), display: "flex", alignItems: "flex-end", padding: 16 }}>
            <span style={{ color: "#fff", fontSize: 12.5, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}>{g.label}</span>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", color: t.muted, fontSize: 12.5, marginTop: 14 }}>Photo tiles are placeholders — production images load from Supabase Storage per listing.</p>
    </section>
  );
}

function Reserve({ r, t }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", party: "2", date: "", time: "" });
  const input = { background: t.dark ? t.bg : "#fff", border: `1px solid ${t.ink}33`, borderRadius: t.radius, padding: "12px 14px", fontSize: 15, color: t.ink, width: "100%", fontFamily: `'${t.body}', sans-serif`, boxSizing: "border-box" };
  const label = { fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, color: t.muted, display: "block", marginBottom: 6 };
  return (
    <section id="reserve" style={{ background: t.dark ? t.surface : t.ink, padding: "72px 24px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: `'${t.display}', serif`, fontSize: "clamp(28px, 4.5vw, 40px)", color: t.dark ? t.ink : t.bg, margin: 0 }}>Reserve your table</h2>
        <p style={{ color: t.dark ? t.muted : `${t.bg}BB`, fontSize: 15, lineHeight: 1.6, margin: "12px 0 28px" }}>
          Send a request and {r.name} will confirm directly — no prepayment needed.
        </p>
        {sent ? (
          <div style={{ background: t.accent, color: "#fff", borderRadius: t.radius, padding: "22px 20px", fontWeight: 600, fontSize: 16 }}>
            Request sent. {r.name} will confirm your table for {form.party} shortly.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, textAlign: "left" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={label}>Your name</span>
              <input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <span style={label}>Guests</span>
              <input style={input} value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} />
            </div>
            <div>
              <span style={label}>Date</span>
              <input style={input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <span style={label}>Time</span>
              <input style={input} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <button onClick={() => setSent(true)} style={{ gridColumn: "1 / -1", background: t.accent, color: "#fff", border: "none", borderRadius: t.radius, padding: "15px", fontSize: 15, fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", fontFamily: `'${t.body}', sans-serif` }}>
              Send reservation request
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Visit({ r, t }) {
  return (
    <section id="visit" style={{ padding: "72px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 36 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700, marginBottom: 12 }}>Hours</div>
          {r.hours.map(([d, h]) => (
            <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${t.ink}14`, fontSize: 15 }}>
              <span style={{ color: t.ink, fontWeight: 600 }}>{d}</span>
              <span style={{ color: t.muted }}>{h}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: t.accent, fontWeight: 700, marginBottom: 12 }}>Find us</div>
          <p style={{ color: t.ink, fontSize: 16, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{r.address}</p>
          <p style={{ color: t.muted, fontSize: 15, margin: "10px 0 0" }}>{r.phone}</p>
          <div style={{ marginTop: 18, height: 130, borderRadius: t.radius, background: `${t.accent}18`, border: `1px dashed ${t.accent}66`, display: "flex", alignItems: "center", justifyContent: "center", color: t.muted, fontSize: 13 }}>
            Map embed (Google Maps / OSM) in production
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ r, t }) {
  const [showLd, setShowLd] = useState(false);
  return (
    <footer style={{ borderTop: `1px solid ${t.ink}18`, padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: `'${t.display}', serif`, fontSize: 20, color: t.ink, fontWeight: 700 }}>{r.name}</div>
      <p style={{ color: t.muted, fontSize: 13, margin: "8px 0 0" }}>
        {r.cuisine} · {r.city}, Eritrea · Part of <span style={{ color: t.accent, fontWeight: 700 }}>eritreantourism.com</span>
      </p>
      <button onClick={() => setShowLd(!showLd)} style={{ marginTop: 14, background: "none", border: `1px solid ${t.ink}33`, color: t.muted, borderRadius: t.radius, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: `'${t.body}', sans-serif` }}>
        {showLd ? "Hide" : "View"} SEO JSON-LD
      </button>
      {showLd && (
        <pre style={{ textAlign: "left", background: t.dark ? "#00000055" : `${t.ink}0A`, color: t.ink, fontSize: 11.5, padding: 16, borderRadius: t.radius, overflowX: "auto", maxWidth: 700, margin: "14px auto 0" }}>
          {JSON.stringify(generateJsonLd(r), null, 2)}
        </pre>
      )}
    </footer>
  );
}

/* ============ THE TEMPLATE (one engine) ============ */
function RestaurantSite({ restaurant: r, theme: t }) {
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: `'${t.body}', sans-serif`, minHeight: "100%", ...texStyle(t) }}>
      <Nav r={r} t={t} />
      <Hero r={r} t={t} />
      <Signatures r={r} t={t} />
      <Menu r={r} t={t} />
      <Story r={r} t={t} />
      <Gallery r={r} t={t} />
      <Reserve r={r} t={t} />
      <Visit r={r} t={t} />
      <Footer r={r} t={t} />
    </div>
  );
}

/* ============ PREVIEW SHELL (dev tool, not shipped) ============ */
export default function App() {
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [slug, setSlug] = useState(RESTAURANTS[0].slug);
  const theme = useMemo(() => THEMES.find((x) => x.id === themeId), [themeId]);
  const restaurant = useMemo(() => RESTAURANTS.find((x) => x.slug === slug), [slug]);
  const idx = THEMES.findIndex((x) => x.id === themeId);

  const sel = { background: "#1E1E24", color: "#fff", border: "1px solid #3A3A44", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "Inter, sans-serif" };
  const arrow = { ...sel, cursor: "pointer", fontWeight: 700, padding: "8px 14px" };

  return (
    <div style={{ minHeight: "100vh", background: "#101014", display: "flex", flexDirection: "column" }}>
      <style>{FONT_CSS}</style>
      {/* Toolbar */}
      <div style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: "#16161B", borderBottom: "1px solid #2A2A32", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ color: "#8B93A7", fontSize: 12, fontFamily: "Inter, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>Template engine</span>
        <select style={sel} value={slug} onChange={(e) => setSlug(e.target.value)}>
          {RESTAURANTS.map((r) => <option key={r.slug} value={r.slug}>{r.name} ({r.city})</option>)}
        </select>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button style={arrow} onClick={() => setThemeId(THEMES[(idx - 1 + THEMES.length) % THEMES.length].id)}>‹</button>
          <select style={{ ...sel, minWidth: 190 }} value={themeId} onChange={(e) => setThemeId(e.target.value)}>
            {THEMES.map((t2, i) => <option key={t2.id} value={t2.id}>{String(i + 1).padStart(2, "0")} — {t2.name}</option>)}
          </select>
          <button style={arrow} onClick={() => setThemeId(THEMES[(idx + 1) % THEMES.length].id)}>›</button>
        </div>
        <span style={{ color: "#6E7688", fontSize: 12, fontFamily: "Inter, sans-serif" }}>{theme.mood} · hero: {theme.hero} · menu: {theme.menu}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <RestaurantSite restaurant={restaurant} theme={theme} />
      </div>
    </div>
  );
}
