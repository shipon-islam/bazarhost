import { ORDER_TRANSITIONS } from '../config/constants.js';
import { nextSequence } from '../models/Counter.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { round2 } from '../utils/query.js';
import { getSettings } from './settings.js';
import { reserveStock, restoreStock } from './stock.js';


export async function nextOrderNumber() {
  const seq = await nextSequence('order');
  return `BZ-${String(seq).padStart(6, '0')}`;
}

const actorOf = (user) => (user ? { user: user._id, name: user.name } : { name: 'System' });

export async function createOrder(input, actor) {
  const settings = await getSettings();

  // Merge duplicate product lines
  const qty = new Map();
  for (const i of input.items) qty.set(i.productId, (qty.get(i.productId) ?? 0) + i.quantity);

  const products = await Product.find({ _id: { $in: [...qty.keys()] } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines = [];
  for (const [id, quantity] of qty) {
    const p = byId.get(id);
    if (!p) throw new ApiError(400, `Product ${id} not found`, { code: 'PRODUCT_NOT_FOUND' });
    if (p.status !== 'active') throw new ApiError(400, `"${p.name}" is not available for sale`, { code: 'PRODUCT_UNAVAILABLE' });
    lines.push({ productId: p._id, name: p.name, sku: p.sku, image: p.images?.[0]?.url, quantity, unitPrice: p.salePrice ?? p.price });
  }

  let customer = input.customer;
  let customerId;
  if (input.customerId) {
    const u = await User.findById(input.customerId);
    if (!u) throw new ApiError(400, 'Customer not found', { code: 'CUSTOMER_NOT_FOUND' });
    customerId = u._id;
    customer = { name: u.name, email: u.email, phone: u.phone };
  }

  const items = lines.map((l) => ({
    product: l.productId, name: l.name, sku: l.sku, image: l.image,
    quantity: l.quantity, unitPrice: l.unitPrice, subtotal: round2(l.unitPrice * l.quantity),
  }));
  const subtotal = round2(items.reduce((s, i) => s + i.subtotal, 0));
  const discount = input.discount ?? 0;
  const shippingFee = input.shippingFee ?? 0;
  const tax = input.tax ?? 0;
  const total = round2(subtotal - discount + shippingFee + tax);
  if (total < 0) throw new ApiError(400, 'Discount cannot exceed the order value', { details: [{ field: 'discount', message: 'Discount too large' }] });

  const status = settings.defaultOrderStatus;
  const orderNumber = await nextOrderNumber();

  await reserveStock(lines);
  try {
    const timeline = [{ type: 'status', status, note: 'Order created', by: actorOf(actor) }];
    if (input.paymentStatus === 'paid') timeline.push({ type: 'payment', status: 'paid', note: 'Marked as paid at creation', by: actorOf(actor) });
    return await Order.create({
      orderNumber,
      customer: customerId,
      customerSnapshot: customer,
      items, subtotal, discount, shippingFee, tax, total,
      currency: settings.currency,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus ?? 'pending',
      transactionId: input.transactionId ?? undefined,
      status,
      billingAddress: input.billingAddress,
      shippingAddress: input.shippingAddress,
      timeline,
      notes: input.note ? [{ text: input.note, by: actorOf(actor) }] : [],
    });
  } catch (err) {
    await restoreStock(lines);
    throw err;
  }
}

/**
 * Moves an order along ORDER_TRANSITIONS. The status flip is an atomic compare-and-set so two admins
 * clicking "Cancel" at once can't restock twice.
 */
export async function transitionOrder(order, newStatus, note, actor) {
  if (!ORDER_TRANSITIONS[order.status]?.includes(newStatus)) {
    throw new ApiError(409, `An order that is ${order.status} cannot be changed to ${newStatus}`, { code: 'INVALID_TRANSITION' });
  }
  const set = { status: newStatus };
  const entries = [{ type: 'status', status: newStatus, note, by: actorOf(actor), at: new Date() }];
  if (newStatus === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
    set.paymentStatus = 'paid';
    entries.push({ type: 'payment', status: 'paid', note: 'Cash collected on delivery', by: actorOf(actor), at: new Date() });
  }
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { $set: set, $push: { timeline: { $each: entries } } },
    { new: true },
  );
  if (!updated) throw new ApiError(409, 'This order was just modified by someone else. Reload and try again.', { code: 'CONFLICT' });

  if (newStatus === 'cancelled') {
    try {
      await restoreStock(order.items.filter((i) => i.product).map((i) => ({ productId: i.product, quantity: i.quantity })));
    } catch (err) {
      console.error(`Failed to restock cancelled order ${order.orderNumber}`, err);
    }
  }
  return updated;
}

export { actorOf };
