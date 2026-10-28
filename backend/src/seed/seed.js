/**
 * Usage:
 *   npm run seed            -> roles, Super Admin account, default settings
 *   npm run seed:demo       -> the above + sample categories, products, customers and ~90 days of orders
 * Safe to re-run: existing records are left untouched.
 */
import crypto from 'node:crypto';
import { connectDB, disconnectDB } from '../config/db.js';
import { ALL_PERMISSIONS } from '../config/constants.js';
import { env } from '../config/env.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { getSettings } from '../services/settings.js';
import { nextOrderNumber } from '../services/orderService.js';
import { slugify } from '../utils/slug.js';

const demo = process.argv.includes('--demo');
if (env.isProd && demo) {
  console.error('Refusing to seed demo data when NODE_ENV=production.');
  process.exit(1);
}

const perms = (map) => Object.entries(map).flatMap(([m, actions]) => actions.map((a) => `${m}:${a}`));
const CRUD = ['view', 'create', 'edit', 'delete'];

const ROLES = [
  { name: 'Super Admin', description: 'Full, unrestricted access. Cannot be edited or deleted.', permissions: ALL_PERMISSIONS, isSuperAdmin: true },
  { name: 'Admin', description: 'Manages the store and users; cannot change roles.', permissions: ALL_PERMISSIONS.filter((p) => !p.startsWith('roles:') || p === 'roles:view') },
  { name: 'Manager', description: 'Day-to-day catalogue and order management.', permissions: perms({ products: CRUD, categories: CRUD, orders: ['view', 'create', 'edit'], users: ['view'], reports: ['view'] }) },
  { name: 'Product Manager', description: 'Manages products and categories.', permissions: perms({ products: CRUD, categories: CRUD }) },
  { name: 'Order Manager', description: 'Processes and fulfils orders.', permissions: perms({ orders: ['view', 'create', 'edit'], products: ['view'], users: ['view'] }) },
  { name: 'Customer', description: 'Storefront customer account (no admin access).', permissions: [], type: 'customer' },
  { name: 'User', description: 'Default self-registered account (no admin access).', permissions: [], type: 'customer' },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedRoles() {
  const out = {};
  for (const r of ROLES) {
    const slug = slugify(r.name);
    // eslint-disable-next-line no-await-in-loop
    out[slug] = (await Role.findOne({ slug })) ?? (await Role.create({ ...r, slug, isSystem: true }));
  }
  return out;
}

async function seedAdmin(role) {
  let admin = await User.findOne({ email: env.SEED_ADMIN_EMAIL });
  if (admin) return console.log(`Admin ${admin.email} already exists – skipped`);
  const password = env.SEED_ADMIN_PASSWORD || `${crypto.randomBytes(12).toString('base64url')}!9a`;
  admin = new User({ name: env.SEED_ADMIN_NAME, email: env.SEED_ADMIN_EMAIL, role: role._id });
  await admin.setPassword(password);
  await admin.save();
  console.log('\n  Super Admin created');
  console.log(`  email:    ${admin.email}`);
  console.log(env.SEED_ADMIN_PASSWORD ? '  password: (from SEED_ADMIN_PASSWORD)' : `  password: ${password}   <- shown once, change it after signing in`);
}

async function seedDemo(roles) {
  if ((await Product.countDocuments()) > 0) return console.log('Products already exist – demo data skipped');
  const settings = await getSettings();

  const parents = await Category.insertMany(['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Groceries'].map((name) => ({ name, slug: slugify(name), status: 'active' })));
  const sub = await Category.create({ name: 'Mobile Accessories', slug: 'mobile-accessories', parent: parents[0]._id, status: 'active' });
  const cats = [...parents, sub];

  const catalogue = [
    ['Wireless Earbuds Pro', 0, 3200, 2690, 48], ['Bluetooth Speaker Mini', 0, 2400, null, 8], ['Smart Watch S2', 0, 6800, 5990, 22],
    ['Fast Charger 65W', 5, 1450, null, 120], ['Phone Case Armor', 5, 650, 520, 4], ['Cotton Panjabi', 1, 1850, 1590, 36],
    ['Denim Jacket', 1, 3400, null, 15], ['Non-stick Fry Pan', 2, 1250, 990, 60], ['Electric Kettle 1.8L', 2, 2150, null, 0],
    ['Aloe Face Wash', 3, 380, null, 200], ['Hair Oil 200ml', 3, 290, 250, 9], ['Basmati Rice 5kg', 4, 780, null, 90],
    ['Mustard Oil 1L', 4, 245, null, 140], ['Green Tea Box', 4, 420, 360, 75],
  ];
  const products = [];
  for (const [i, [name, c, price, salePrice, stock]] of catalogue.entries()) {
    // eslint-disable-next-line no-await-in-loop
    products.push(await Product.create({
      name, slug: slugify(name), sku: `BZ-${1000 + i}`, category: cats[c]._id, price, salePrice, stockQuantity: stock,
      shortDescription: `Demo product: ${name}`, status: i === 13 ? 'draft' : 'active', featured: i % 4 === 0,
      createdAt: new Date(Date.now() - rand(0, 60) * 86400000),
    }));
  }

  const names = ['Rahim Uddin', 'Karima Begum', 'Tanvir Ahmed', 'Nusrat Jahan', 'Sabbir Hossain', 'Mim Akter', 'Imran Khan', 'Sadia Islam', 'Fahim Rahman', 'Tasnim Sultana', 'Arif Chowdhury', 'Lamia Parvin'];
  const customers = [];
  for (const [i, name] of names.entries()) {
    // eslint-disable-next-line no-await-in-loop
    customers.push(await User.create({
      name, email: `${slugify(name)}@example.com`, phone: `+88017${rand(10000000, 99999999)}`, role: roles.customer._id,
      address: { line1: `${rand(1, 99)} Main Road`, city: pick(['Dhaka', 'Rajshahi', 'Sirajganj', 'Chattogram', 'Khulna']), country: 'Bangladesh' },
      createdAt: new Date(Date.now() - rand(0, 90) * 86400000 - i * 1000),
    }));
  }

  for (let n = 0; n < 90; n += 1) {
    const ageDays = rand(0, 89);
    const createdAt = new Date(Date.now() - ageDays * 86400000 - rand(0, 86000) * 1000);
    const cust = pick(customers);
    const items = Array.from({ length: rand(1, 3) }, () => {
      const p = pick(products.filter((x) => x.status === 'active'));
      const quantity = rand(1, 3);
      const unitPrice = p.salePrice ?? p.price;
      return { product: p._id, name: p.name, sku: p.sku, quantity, unitPrice, subtotal: unitPrice * quantity };
    });
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const shippingFee = 80;
    const status = ageDays > 10 ? pick(['delivered', 'delivered', 'delivered', 'delivered', 'cancelled']) : pick(['pending', 'processing', 'shipped', 'delivered']);
    const paymentMethod = pick(['cod', 'bkash', 'nagad', 'card']);
    const paymentStatus = status === 'delivered' ? 'paid' : status === 'cancelled' ? pick(['failed', 'refunded']) : paymentMethod === 'cod' ? 'pending' : pick(['paid', 'pending']);
    // eslint-disable-next-line no-await-in-loop
    const orderNumber = await nextOrderNumber();
    // eslint-disable-next-line no-await-in-loop
    await Order.create({
      orderNumber, customer: cust._id, customerSnapshot: { name: cust.name, email: cust.email, phone: cust.phone },
      items, subtotal, shippingFee, total: subtotal + shippingFee, currency: settings.currency, paymentMethod, paymentStatus, status,
      shippingAddress: { fullName: cust.name, phone: cust.phone, ...cust.address.toObject() },
      timeline: [{ type: 'status', status: 'pending', note: 'Order created', at: createdAt }, ...(status !== 'pending' ? [{ type: 'status', status, at: createdAt }] : [])],
      createdAt,
    });
  }
  console.log(`Demo data created: ${cats.length} categories, ${products.length} products, ${customers.length} customers, 90 orders`);
}

await connectDB();
const roles = await seedRoles();
await seedAdmin(roles['super-admin']);
await getSettings();
if (demo) await seedDemo(roles);
console.log('\nSeed complete.');
await disconnectDB();
