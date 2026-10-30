/**
 * MOCK DATA: every number, name and order in this file is fabricated.
 * Generated from a fixed seed so the dashboard looks identical on every load.
 * TODO: delete this folder once the real backend is connected.
 */
import { emptyPermissions, fullPermissions } from "@/lib/permissions";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/category";
import type {
  Address,
  Order,
  OrderItem,
  OrderStatus,
  OrderTimelineEntry,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";
import type { Product } from "@/types/product";
import type {
  PermissionAction,
  PermissionMap,
  PermissionModule,
  Role,
} from "@/types/role";
import type { StoreSettings } from "@/types/settings";
import type { User } from "@/types/user";

/** Fixed "now" so relative dates (today / last 7 days …) are reproducible. */
export const MOCK_NOW = new Date("2026-10-25T01:58:00+06:00").getTime();
export const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

const ALL: PermissionAction[] = ["view", "create", "edit", "delete"];
const V: PermissionAction[] = ["view"];
const VE: PermissionAction[] = ["view", "edit"];
const VCE: PermissionAction[] = ["view", "create", "edit"];

function perms(
  spec: Partial<Record<PermissionModule, PermissionAction[]>>,
): PermissionMap {
  return { ...emptyPermissions(), ...spec };
}

export const ROLE_IDS = {
  superAdmin: "r-super-admin",
  admin: "r-admin",
  manager: "r-manager",
  productManager: "r-product-manager",
  orderManager: "r-order-manager",
  customer: "r-customer",
} as const;

function seedRoles(): Role[] {
  return [
    {
      id: ROLE_IDS.superAdmin,
      name: "Super Admin",
      description: "Unrestricted access. Cannot be deleted or edited.",
      isSystem: true,
      permissions: fullPermissions(),
    },
    {
      id: ROLE_IDS.admin,
      name: "Admin",
      description: "Runs the store day to day; can view but not change roles.",
      isSystem: false,
      permissions: perms({
        products: ALL,
        categories: ALL,
        orders: ALL,
        users: ALL,
        roles: V,
        reports: V,
        settings: VE,
      }),
    },
    {
      id: ROLE_IDS.manager,
      name: "Manager",
      description: "Manages catalogue and fulfilment, read-only on people.",
      isSystem: false,
      permissions: perms({
        products: VCE,
        categories: VCE,
        orders: VE,
        users: V,
        reports: V,
      }),
    },
    {
      id: ROLE_IDS.productManager,
      name: "Product Manager",
      description: "Owns products and categories.",
      isSystem: false,
      permissions: perms({ products: ALL, categories: ALL, reports: V }),
    },
    {
      id: ROLE_IDS.orderManager,
      name: "Order Manager",
      description: "Processes and ships orders.",
      isSystem: false,
      permissions: perms({ orders: VE, users: V }),
    },
    {
      id: ROLE_IDS.customer,
      name: "Customer",
      description: "Storefront shoppers. No admin access.",
      isSystem: true,
      permissions: emptyPermissions(),
    },
  ];
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

type CatSeed = [
  id: string,
  name: string,
  emoji: string,
  parentId: string | null,
  desc: string,
];

const CATEGORY_SEEDS: CatSeed[] = [
  [
    "c-electronics",
    "Electronics",
    "📱",
    null,
    "Gadgets, audio and everyday tech.",
  ],
  [
    "c-mobile-acc",
    "Mobile Accessories",
    "🎧",
    "c-electronics",
    "Chargers, cases and cables.",
  ],
  [
    "c-fashion",
    "Fashion",
    "👜",
    null,
    "Clothing and accessories for everyone.",
  ],
  [
    "c-mens",
    "Men's Wear",
    "👕",
    "c-fashion",
    "Panjabi, shirts, trousers and more.",
  ],
  ["c-womens", "Women's Wear", "👗", "c-fashion", "Sarees, kurtis and bags."],
  ["c-home", "Home & Living", "🏠", null, "Furnishing and home décor."],
  ["c-kitchen", "Kitchen", "🍳", "c-home", "Cookware and small appliances."],
  ["c-beauty", "Beauty", "💄", null, "Skincare, makeup and hair care."],
  ["c-groceries", "Groceries", "🛒", null, "Pantry staples and tea."],
  [
    "c-sports",
    "Sports & Fitness",
    "🧘",
    null,
    "Gear for training at home or outdoors.",
  ],
  ["c-books", "Books", "📚", null, "Fiction and children's books."],
  ["c-toys", "Toys", "🧸", null, "Play and learning for kids."],
];

function seedCategories(rand: () => number): Category[] {
  return CATEGORY_SEEDS.map(([id, name, emoji, parentId, desc], i) => ({
    id,
    name,
    slug: slugify(name),
    description: desc,
    image: null,
    parentId,
    // One hidden category so the status filter has something to show.
    status: id === "c-toys" ? "hidden" : "active",
    seoTitle: `${name} | BazarHost`,
    seoDescription: `Shop ${name.toLowerCase()} online at BazarHost.`,
    createdAt: new Date(
      MOCK_NOW - (300 - i * 12 + Math.floor(rand() * 5)) * DAY_MS,
    ).toISOString(),
    emoji,
  }));
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

type ProdSeed = [
  name: string,
  categoryId: string,
  price: number,
  emoji: string,
];

const PRODUCT_SEEDS: ProdSeed[] = [
  ["Wireless Earbuds Pro", "c-electronics", 2490, "🎧"],
  ["Smart Watch Series 5", "c-electronics", 4990, "⌚"],
  ["Bluetooth Speaker Mini", "c-electronics", 1890, "🔊"],
  ["4K Action Camera", "c-electronics", 6990, "📷"],
  ["Power Bank 20000mAh", "c-electronics", 1790, "🔋"],
  ["LED Desk Lamp", "c-electronics", 990, "💡"],
  ["Fast Charger 65W", "c-mobile-acc", 1290, "🔌"],
  ["Shockproof Phone Case", "c-mobile-acc", 490, "📱"],
  ["Tempered Glass Guard", "c-mobile-acc", 290, "🛡️"],
  ["USB-C Cable 2m", "c-mobile-acc", 390, "🔗"],
  ["Cotton Panjabi", "c-mens", 1890, "👘"],
  ["Slim Fit Chinos", "c-mens", 1490, "👖"],
  ["Leather Wallet", "c-mens", 890, "👛"],
  ["Classic Polo Shirt", "c-mens", 790, "👕"],
  ["Handloom Saree", "c-womens", 3490, "🥻"],
  ["Printed Cotton Kurti", "c-womens", 1290, "👗"],
  ["Leather Handbag", "c-womens", 2790, "👜"],
  ["Silk Scarf", "c-womens", 690, "🧣"],
  ["Memory Foam Pillow", "c-home", 1190, "🛏️"],
  ["Cotton Bedsheet Set", "c-home", 2190, "🛌"],
  ["Modern Wall Clock", "c-home", 890, "🕰️"],
  ["Scented Candle Set", "c-home", 650, "🕯️"],
  ["Non-stick Fry Pan", "c-kitchen", 1390, "🍳"],
  ["Electric Kettle 1.8L", "c-kitchen", 1590, "☕"],
  ["Rice Cooker 3L", "c-kitchen", 3290, "🍚"],
  ["Kitchen Knife Set 6pc", "c-kitchen", 1990, "🔪"],
  ["Vitamin C Serum", "c-beauty", 990, "🧴"],
  ["Herbal Face Wash", "c-beauty", 390, "🧼"],
  ["Matte Lipstick Set", "c-beauty", 1190, "💋"],
  ["Argan Hair Oil", "c-beauty", 690, "💆"],
  ["Premium Basmati Rice 5kg", "c-groceries", 890, "🌾"],
  ["Mustard Oil 1L", "c-groceries", 420, "🫒"],
  ["Darjeeling Tea 500g", "c-groceries", 590, "🍵"],
  ["Mixed Nuts 1kg", "c-groceries", 1490, "🥜"],
  ["Yoga Mat 6mm", "c-sports", 1190, "🧘"],
  ["Adjustable Dumbbell Set", "c-sports", 4490, "🏋️"],
  ["Running Shoes", "c-sports", 3290, "👟"],
  ["Speed Skipping Rope", "c-sports", 290, "🪢"],
  ["Bestseller Novel Bundle", "c-books", 1590, "📚"],
  ["Kids Story Collection", "c-books", 990, "📖"],
  ["Building Blocks 500pc", "c-toys", 1790, "🧱"],
  ["Remote Control Car", "c-toys", 2290, "🚗"],
];

const SKU_PREFIX: Record<string, string> = {
  "c-electronics": "ELE",
  "c-mobile-acc": "MOB",
  "c-mens": "MEN",
  "c-womens": "WOM",
  "c-home": "HOM",
  "c-kitchen": "KIT",
  "c-beauty": "BEA",
  "c-groceries": "GRO",
  "c-sports": "SPO",
  "c-books": "BOO",
  "c-toys": "TOY",
};

function seedProducts(rand: () => number): Product[] {
  return PRODUCT_SEEDS.map(([name, categoryId, price, emoji], i) => {
    const r = rand();
    // A handful of low-stock / out-of-stock items for the dashboard alert list.
    const stock =
      i % 9 === 4
        ? 0
        : i % 7 === 3
          ? 2 + Math.floor(rand() * 7)
          : 12 + Math.floor(rand() * 180);
    const status: Product["status"] =
      i % 13 === 6 ? "draft" : i % 17 === 9 ? "archived" : "active";
    const onSale = r < 0.3;
    return {
      id: `p-${i + 1}`,
      name,
      slug: slugify(name),
      sku: `BH-${SKU_PREFIX[categoryId] ?? "GEN"}-${String(i + 1).padStart(3, "0")}`,
      shortDescription: `${name}: quality you can trust, delivered across Bangladesh.`,
      description: `${name} from BazarHost. Carefully sourced, quality checked and backed by our 7-day return policy.`,
      images: [],
      categoryId,
      price,
      salePrice: onSale
        ? Math.round((price * (0.8 + rand() * 0.12)) / 10) * 10
        : null,
      stock,
      stockStatus: stock > 0 ? "in_stock" : "out_of_stock",
      status,
      featured: i % 6 === 0,
      seoTitle: `${name} | BazarHost`,
      seoDescription: `Buy ${name} online at the best price in Bangladesh.`,
      createdAt: new Date(
        MOCK_NOW - Math.floor((i + 1) * 2.7 + rand() * 4) * DAY_MS,
      ).toISOString(),
      emoji,
    };
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const FIRST = [
  "Rahim",
  "Karim",
  "Nusrat",
  "Tasnim",
  "Sabbir",
  "Farhana",
  "Imran",
  "Mim",
  "Arif",
  "Sadia",
  "Jubayer",
  "Tania",
  "Mahmud",
  "Nabila",
  "Shakil",
  "Rima",
  "Habib",
  "Lamia",
  "Rafiq",
  "Sumaiya",
];
const LAST = [
  "Uddin",
  "Hossain",
  "Jahan",
  "Akter",
  "Ahmed",
  "Islam",
  "Chowdhury",
  "Rahman",
  "Khan",
  "Sarker",
];
const CITIES = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Sirajganj",
  "Khulna",
  "Sylhet",
  "Bogura",
  "Cumilla",
];

function phone(rand: () => number): string {
  const n = String(Math.floor(rand() * 1e8)).padStart(8, "0");
  return `+88017${n}`;
}

function seedUsers(rand: () => number): User[] {
  const staff: Array<[string, string, string]> = [
    ["Tanvir Rahman", ROLE_IDS.superAdmin, "admin@bazarhost.com"],
    ["Mehnaz Sultana", ROLE_IDS.admin, "mehnaz@example.com"],
    ["Fahim Ahsan", ROLE_IDS.manager, "fahim@example.com"],
    ["Priya Das", ROLE_IDS.productManager, "priya@example.com"],
    ["Zahid Hasan", ROLE_IDS.orderManager, "zahid@example.com"],
  ];
  const users: User[] = staff.map(([name, roleId, email], i) => ({
    id: `u-${i + 1}`,
    name,
    email,
    phone: phone(rand),
    roleId,
    status: "active",
    address: `${CITIES[i % CITIES.length]}, Bangladesh`,
    avatarUrl: null,
    createdAt: new Date(MOCK_NOW - (420 - i * 20) * DAY_MS).toISOString(),
    lastLoginAt: new Date(
      MOCK_NOW - Math.floor(rand() * 3 * DAY_MS),
    ).toISOString(),
  }));

  const customerCount = 40;
  const customers: User[] = [];
  for (let i = 0; i < customerCount; i++) {
    const first = FIRST[i % FIRST.length] ?? "Customer";
    const last =
      LAST[(i * 3 + Math.floor(i / FIRST.length)) % LAST.length] ?? "User";
    const age =
      i < 6
        ? 380 + Math.floor(rand() * 40)
        : Math.floor(Math.pow(rand(), 1.4) * 360) + 1;
    const roll = rand();
    const status: User["status"] =
      roll < 0.06 ? "suspended" : roll < 0.12 ? "disabled" : "active";
    customers.push({
      id: `u-${staff.length + i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@example.com`,
      phone: phone(rand),
      roleId: ROLE_IDS.customer,
      status,
      address: `House ${1 + Math.floor(rand() * 90)}, Road ${1 + Math.floor(rand() * 20)}, ${CITIES[Math.floor(rand() * CITIES.length)]}`,
      avatarUrl: null,
      createdAt: new Date(MOCK_NOW - age * DAY_MS).toISOString(),
      lastLoginAt:
        rand() < 0.1
          ? null
          : new Date(MOCK_NOW - Math.floor(rand() * 40 * DAY_MS)).toISOString(),
    });
  }
  return [...users, ...customers];
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)] as T;
}

function addressFor(user: User, rand: () => number): Address {
  const city = pick(rand, CITIES);
  return {
    name: user.name,
    phone: user.phone,
    line1: user.address.split(",")[0] ?? user.address,
    city,
    postalCode: String(1000 + Math.floor(rand() * 8000)),
    country: "Bangladesh",
  };
}

function chooseStatus(ageDays: number, rand: () => number): OrderStatus {
  const r = rand();
  if (ageDays < 2)
    return r < 0.45
      ? "pending"
      : r < 0.8
        ? "processing"
        : r < 0.95
          ? "shipped"
          : "cancelled";
  if (ageDays < 14)
    return r < 0.15
      ? "processing"
      : r < 0.5
        ? "shipped"
        : r < 0.95
          ? "delivered"
          : "cancelled";
  return r < 0.86 ? "delivered" : r < 0.88 ? "shipped" : "cancelled";
}

function choosePayment(
  status: OrderStatus,
  method: PaymentMethod,
  rand: () => number,
): { paymentStatus: PaymentStatus; refunded: boolean } {
  if (status === "cancelled") {
    if (method === "cod") return { paymentStatus: "pending", refunded: false };
    return rand() < 0.7
      ? { paymentStatus: "refunded", refunded: true }
      : { paymentStatus: "failed", refunded: false };
  }
  if (status === "delivered") return { paymentStatus: "paid", refunded: false };
  if (method === "cod") return { paymentStatus: "pending", refunded: false };
  if (status === "pending")
    return {
      paymentStatus: rand() < 0.7 ? "pending" : "failed",
      refunded: false,
    };
  return { paymentStatus: "paid", refunded: false };
}

function seedOrders(
  rand: () => number,
  products: Product[],
  users: User[],
): Order[] {
  const customers = users
    .filter((u) => u.roleId === ROLE_IDS.customer)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const sellable = products.filter((p) => p.status === "active");
  const methods: PaymentMethod[] = [
    "bkash",
    "bkash",
    "bkash",
    "bkash",
    "nagad",
    "nagad",
    "card",
    "card",
    "cod",
    "cod",
    "cod",
  ];
  const total = 520;

  const times: number[] = [];
  for (let i = 0; i < total; i++) {
    // The first few land in the last 20 hours so "Today" has data.
    if (i < 9) times.push(MOCK_NOW - Math.floor(rand() * 20 * HOUR_MS));
    else
      times.push(
        MOCK_NOW -
          Math.floor(Math.pow(rand(), 1.6) * 365 * DAY_MS) -
          20 * HOUR_MS,
      );
  }
  times.sort((a, b) => a - b); // oldest first → ascending order numbers

  return times.map((t, idx) => {
    const eligible = customers.filter(
      (c) => new Date(c.createdAt).getTime() <= t,
    );
    const customer = pick(rand, eligible.length > 0 ? eligible : customers);
    const ageDays = (MOCK_NOW - t) / DAY_MS;

    const lineCount = 1 + Math.floor(rand() * 3.4);
    const chosen = new Set<number>();
    while (chosen.size < Math.min(lineCount, sellable.length))
      chosen.add(Math.floor(rand() * sellable.length));
    const items: OrderItem[] = [...chosen].map((pi) => {
      const p = sellable[pi] as Product;
      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        quantity: 1 + Math.floor(rand() * rand() * 3),
        unitPrice: p.salePrice ?? p.price,
      };
    });

    const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const discount =
      rand() < 0.25
        ? Math.round((subtotal * (0.05 + rand() * 0.05)) / 10) * 10
        : 0;
    const shippingAddress = addressFor(customer, rand);
    const shipping = shippingAddress.city === "Dhaka" ? 60 : 120;
    const tax = Math.round((subtotal - discount) * 0.05);
    const status = chooseStatus(ageDays, rand);
    const method = pick(rand, methods);
    const { paymentStatus, refunded } = choosePayment(status, method, rand);

    const at = (offsetHours: number) =>
      new Date(Math.min(t + offsetHours * HOUR_MS, MOCK_NOW)).toISOString();
    const timeline: OrderTimelineEntry[] = [{ status: "pending", at: at(0) }];
    if (status === "cancelled")
      timeline.push({ status: "cancelled", at: at(2 + rand() * 20) });
    else {
      if (status !== "pending")
        timeline.push({ status: "processing", at: at(3 + rand() * 6) });
      if (status === "shipped" || status === "delivered")
        timeline.push({ status: "shipped", at: at(26 + rand() * 12) });
      if (status === "delivered")
        timeline.push({ status: "delivered", at: at(72 + rand() * 48) });
    }
    if (refunded)
      timeline.push({ status: "refunded", at: at(30 + rand() * 20) });

    const num = 10001 + idx;
    return {
      id: `o-${num}`,
      number: `BH-${num}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      createdAt: new Date(t).toISOString(),
      items,
      itemCount: items.reduce((s, it) => s + it.quantity, 0),
      subtotal,
      discount,
      shipping,
      tax,
      total: subtotal - discount + shipping + tax,
      paymentMethod: method,
      paymentStatus,
      transactionId:
        method !== "cod" &&
        (paymentStatus === "paid" || paymentStatus === "refunded")
          ? `TXN${String(Math.floor(rand() * 1e10)).padStart(10, "0")}`
          : null,
      status,
      billingAddress: addressFor(customer, rand),
      shippingAddress,
      timeline,
      notes:
        rand() < 0.08
          ? [
              {
                id: `n-${num}-1`,
                text: "Customer asked for delivery after 5 PM.",
                author: "Zahid Hasan",
                at: at(1),
              },
            ]
          : [],
    };
  });
}

// ---------------------------------------------------------------------------
// Settings + assembly
// ---------------------------------------------------------------------------

function seedSettings(): StoreSettings {
  return {
    storeName: "BazarHost",
    contactEmail: "support@bazarhost.com",
    supportPhone: "",
    websiteUrl: "https://bazarhost.com",
    timezone: "Asia/Dhaka",
    currency: "BDT",
    logo: null,
    defaultLanguage: "en",
    weightUnit: "kg",
    defaultOrderStatus: "pending",
    lowStockThreshold: 10,
    notifications: {
      newOrderEmail: true,
      newOrderSms: false,
      lowStockEmail: true,
      weeklySummaryEmail: false,
    },
  };
}

export interface MockDb {
  categories: Category[];
  products: Product[];
  users: User[];
  roles: Role[];
  orders: Order[];
  settings: StoreSettings;
}

export function createSeed(): MockDb {
  const rand = mulberry32(20261025);
  const categories = seedCategories(rand);
  const products = seedProducts(rand);
  const users = seedUsers(rand);
  const roles = seedRoles();
  const orders = seedOrders(rand, products, users);
  return {
    categories,
    products,
    users,
    roles,
    orders,
    settings: seedSettings(),
  };
}
