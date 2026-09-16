export type Product = {
  id: string;
  name: string;
  category: "Electronics" | "Fashion" | "Home & Living" | "And More";
  price: number;
  oldPrice?: number;
  badge?: string;
  icon: string;
  accent: string;
  rating: number;
  reviews: number;
  short: string;
  description: string;
  specs: string[];
  stock: number;
};

export const products: Product[] = [
  {
    id: "wireless-earbuds-pro",
    name: "AirPulse Pro Wireless Earbuds",
    category: "Electronics",
    price: 2450,
    oldPrice: 3200,
    badge: "Bestseller",
    icon: "🎧",
    accent: "from-navy to-navy-light",
    rating: 4.6,
    reviews: 812,
    short: "Active noise cancelling, 30hr battery life.",
    description:
      "AirPulse Pro pairs punchy bass with genuine active noise cancelling, so your commute through Dhaka traffic stays quiet. A 30-hour combined battery life and quick-charge case mean you rarely think about power.",
    specs: [
      "Active Noise Cancelling (ANC)",
      "30 hours total playback with case",
      "IPX5 sweat and splash resistant",
      "Bluetooth 5.3, dual-device pairing",
    ],
    stock: 34,
  },
  {
    id: "smart-led-tv-43",
    name: "Vistalux 43\" Smart LED TV",
    category: "Electronics",
    price: 24999,
    oldPrice: 29999,
    icon: "📺",
    accent: "from-ink to-navy",
    rating: 4.4,
    reviews: 265,
    short: "Full HD display with built-in streaming apps.",
    description:
      "A crisp Full HD panel with built-in access to your favourite streaming apps, three HDMI ports for your set-top box and gaming console, and a slim bezel that suits any living room.",
    specs: [
      "43-inch Full HD LED panel",
      "Built-in Wi-Fi and streaming apps",
      "3x HDMI, 2x USB ports",
      "Includes wall-mount bracket",
    ],
    stock: 11,
  },
  {
    id: "powerbank-20000",
    name: "VoltCore 20,000mAh Power Bank",
    category: "Electronics",
    price: 1350,
    icon: "🔋",
    accent: "from-orange-dark to-orange",
    rating: 4.5,
    reviews: 1204,
    short: "Fast-charge two devices at once.",
    description:
      "Never run out mid-day. VoltCore holds enough charge for multiple full phone top-ups and pushes power through two ports at once with 22.5W fast charging.",
    specs: [
      "20,000mAh capacity",
      "22.5W fast charge, dual USB output",
      "LED charge-level display",
      "Includes USB-C cable",
    ],
    stock: 58,
  },
  {
    id: "mens-panjabi",
    name: "Handloom Cotton Panjabi",
    category: "Fashion",
    price: 1890,
    oldPrice: 2400,
    badge: "New",
    icon: "👕",
    accent: "from-navy-dark to-navy",
    rating: 4.7,
    reviews: 96,
    short: "Breathable handloom cotton, festive embroidery.",
    description:
      "Woven from breathable handloom cotton and finished with fine hand embroidery at the collar, this panjabi is built for long Eid days and warm evenings alike.",
    specs: [
      "100% handloom cotton",
      "Hand embroidered collar placket",
      "Available sizes: M, L, XL, XXL",
      "Machine washable, colourfast",
    ],
    stock: 42,
  },
  {
    id: "womens-jamdani-saree",
    name: "Jamdani Weave Saree",
    category: "Fashion",
    price: 3650,
    icon: "🥻",
    accent: "from-orange to-orange-light",
    rating: 4.8,
    reviews: 154,
    short: "Traditional Jamdani motifs, soft cotton blend.",
    description:
      "Hand-loomed Jamdani motifs on a soft cotton-silk blend, drapes light enough for daily wear and detailed enough for festive occasions. Comes with a matching blouse piece.",
    specs: [
      "Cotton-silk blend, Jamdani weave",
      "Includes matching blouse piece",
      "Length: 6.5 metres",
      "Dry clean recommended",
    ],
    stock: 21,
  },
  {
    id: "sneakers-urban",
    name: "Urban Stride Sneakers",
    category: "Fashion",
    price: 2100,
    oldPrice: 2650,
    icon: "👟",
    accent: "from-ink to-navy-light",
    rating: 4.3,
    reviews: 340,
    short: "Cushioned sole for all-day comfort.",
    description:
      "A memory-foam insole and grippy rubber outsole make these the pair you reach for whether you're catching a rickshaw or walking the whole day.",
    specs: [
      "Breathable knit upper",
      "Memory-foam cushioned insole",
      "Sizes 39–44 available",
      "Non-slip rubber outsole",
    ],
    stock: 65,
  },
  {
    id: "cookware-set",
    name: "ChefLine 5-Piece Non-Stick Cookware Set",
    category: "Home & Living",
    price: 3200,
    oldPrice: 4100,
    badge: "Bestseller",
    icon: "🍳",
    accent: "from-orange-dark to-orange",
    rating: 4.6,
    reviews: 428,
    short: "Non-stick coating, works on gas and induction.",
    description:
      "Five everyday essentials — frypan, saucepan, and casserole with lids — coated for easy release and easy cleanup. Compatible with gas and induction stoves.",
    specs: [
      "5-piece set: fry pan, sauce pan, casserole",
      "Food-grade non-stick coating",
      "Gas and induction compatible",
      "Heat-resistant handles",
    ],
    stock: 29,
  },
  {
    id: "bedsheet-set",
    name: "CloudNine Cotton Bedsheet Set (King)",
    category: "Home & Living",
    price: 1650,
    icon: "🛏️",
    accent: "from-navy to-navy-light",
    rating: 4.5,
    reviews: 189,
    short: "300 thread count cotton, king size with 2 pillow covers.",
    description:
      "Soft 300 thread-count cotton that softens further with every wash. Includes a fitted bedsheet and two matching pillow covers sized for king beds.",
    specs: [
      "300 thread count, 100% cotton",
      "Fitted sheet + 2 pillow covers",
      "Fits mattresses up to 10 inches deep",
      "Machine washable",
    ],
    stock: 47,
  },
  {
    id: "led-desk-lamp",
    name: "Beam Adjustable LED Desk Lamp",
    category: "Home & Living",
    price: 890,
    icon: "💡",
    accent: "from-ink to-navy",
    rating: 4.4,
    reviews: 212,
    short: "3 brightness modes, USB rechargeable.",
    description:
      "A flexible-arm desk lamp with three brightness modes and a warm-to-cool colour switch, built for late study sessions and work-from-home evenings. USB rechargeable.",
    specs: [
      "3 brightness levels, 3 colour tones",
      "USB-C rechargeable, 10hr runtime",
      "Foldable, adjustable arm",
      "Touch-sensitive control",
    ],
    stock: 73,
  },
  {
    id: "kids-storybook-set",
    name: "Bangla Rhymes & Stories Box Set",
    category: "And More",
    price: 750,
    icon: "📚",
    accent: "from-orange to-orange-light",
    rating: 4.9,
    reviews: 88,
    short: "5 illustrated Bangla storybooks for ages 3-8.",
    description:
      "Five brightly illustrated storybooks in Bangla, written for early readers and read-aloud time with parents. A gentle way to build a home library.",
    specs: [
      "Set of 5 illustrated storybooks",
      "Language: Bangla",
      "Recommended ages 3–8",
      "Sturdy board-book covers",
    ],
    stock: 40,
  },
  {
    id: "skincare-combo",
    name: "GlowBari Daily Skincare Combo",
    category: "And More",
    price: 1190,
    oldPrice: 1450,
    badge: "New",
    icon: "🧴",
    accent: "from-navy-dark to-navy",
    rating: 4.5,
    reviews: 176,
    short: "Cleanser, toner and moisturiser for daily use.",
    description:
      "A simple three-step routine — gentle cleanser, alcohol-free toner, and lightweight moisturiser — formulated for Dhaka's humid climate and everyday wear.",
    specs: [
      "3-step set: cleanser, toner, moisturiser",
      "Alcohol-free, fragrance-free formula",
      "Suitable for all skin types",
      "Net volume: 100ml each",
    ],
    stock: 55,
  },
  {
    id: "yoga-mat",
    name: "FlexFit Non-Slip Yoga Mat",
    category: "And More",
    price: 980,
    icon: "🧘",
    accent: "from-orange-dark to-orange",
    rating: 4.6,
    reviews: 143,
    short: "6mm cushioning, textured non-slip surface.",
    description:
      "6mm of cushioning protects your joints while the textured surface keeps its grip through the sweatiest session. Rolls up with a carry strap included.",
    specs: [
      "6mm thickness, dual-layer foam",
      "Textured non-slip surface",
      "Includes carry strap",
      "Size: 183cm x 61cm",
    ],
    stock: 62,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
