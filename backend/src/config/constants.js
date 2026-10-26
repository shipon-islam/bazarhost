export const MODULES = ['products', 'categories', 'orders', 'users', 'roles', 'reports', 'settings'];
export const ACTIONS = ['view', 'create', 'edit', 'delete'];
export const ALL_PERMISSIONS = MODULES.flatMap((m) => ACTIONS.map((a) => `${m}:${a}`));

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
export const PAYMENT_METHODS = ['cod', 'card', 'bkash', 'nagad', 'bank_transfer', 'other'];
export const PRODUCT_STATUSES = ['active', 'draft', 'archived'];
export const STOCK_STATUSES = ['in_stock', 'out_of_stock', 'on_backorder'];
export const CATEGORY_STATUSES = ['active', 'draft', 'hidden'];
export const USER_STATUSES = ['active', 'disabled', 'suspended'];

// Allowed fulfilment transitions. Delivered / cancelled are terminal.
export const ORDER_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};
