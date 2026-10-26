import Link from "next/link";
export const metadata = { title: "Order placed" };

export default async function Success({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl" aria-hidden>✅</p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-900">Order placed</h1>
      <p className="mt-3 text-slate-600">Your order number is <b className="text-navy-900">{id}</b>. We will call you to confirm before delivery. Pay in cash when it arrives.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/track" className="rounded-xl bg-navy-900 px-6 py-3 font-semibold text-white hover:bg-navy-800">Track order</Link>
        <Link href="/" className="rounded-xl px-6 py-3 font-semibold ring-1 ring-slate-300 hover:bg-surface">Keep shopping</Link>
      </div>
    </div>
  );
}
