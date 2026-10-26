export const metadata = { title: "Delivery & returns" };

// TODO: Replace every line below with BazarHost's real policy before launch.
export default function DeliveryReturns() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">Delivery &amp; returns</h1>
      <h2 className="mt-8 text-xl font-bold text-navy-900">Delivery</h2>
      <p className="mt-2 text-slate-600">Orders over ৳2,000 ship free. Smaller orders pay a delivery fee that is shown at checkout. We call to confirm every order before it ships.</p>
      <h2 className="mt-8 text-xl font-bold text-navy-900">Payment</h2>
      <p className="mt-2 text-slate-600">Pay in cash when your order arrives. Online payment options are coming soon.</p>
      <h2 className="mt-8 text-xl font-bold text-navy-900">Returns</h2>
      <p className="mt-2 text-slate-600">If your item is wrong or damaged, contact us and we will help. Add your return window and conditions here.</p>
    </div>
  );
}
