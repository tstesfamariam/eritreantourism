/**
 * seed_restaurants.js — sample listings for the /eat vertical
 * Fictional seed data (like Asmara Palace / Crystal Hotel in 002_seed_hotels.sql).
 * Each object = one row: theme_id → listings.theme_id, rest → listings.site_config (jsonb).
 * Shape matches RESTAURANTS in restaurant-template-engine.jsx exactly.
 */

export const SEED_RESTAURANTS = [
  {
    theme_id: "highland",
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
    theme_id: "fiori",
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
    theme_id: "steel-steam",
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
    theme_id: "keren-bloom",
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
    theme_id: "sahel",
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
    theme_id: "shuq",
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
    theme_id: "dahlak",
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
