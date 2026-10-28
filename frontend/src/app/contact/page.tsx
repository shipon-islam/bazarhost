import ContactForm from "@/components/ContactForm";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
export const metadata = {
  title: "Contact us",
  description:
    "Questions about a product or an order? Call, WhatsApp, email or send us a message.",
};

const channels = [
  {
    Icon: MessageCircle,
    title: "WhatsApp",
    value: "+880 1829258553",
    href: "https://wa.me/8801829258553",
    note: "Fastest way to reach us",
  },
  {
    Icon: Phone,
    title: "Call us",
    value: "+880 1829258553",
    href: "tel:+8801829258553",
    note: "Talk to a real person",
  },
  {
    Icon: Mail,
    title: "Email",
    value: "bazarhostbd@gmail.com",
    href: "mailto:bazarhostbd@gmail.com",
    note: "For longer questions",
  },
  {
    Icon: MapPin,
    title: "Based in",
    value: "Dhaka, Bangladesh",
    href: undefined,
    note: "Delivering across the country",
  },
];

// TODO: confirm these answers with the business.
const faqs = [
  [
    "Can I pay when the order arrives?",
    "Yes. Cash on delivery is available on every order.",
  ],
  [
    "How do I track my order?",
    "Use the Track order page with your order number and the phone number you ordered with.",
  ],
  [
    "Is delivery free?",
    "Orders over ৳2,000 ship free. Smaller orders pay a delivery fee shown at checkout.",
  ],
  [
    "What if my item is wrong or damaged?",
    "Contact us on WhatsApp or phone with your order number and we will help.",
  ],
] as const;

export default function Contact() {
  return (
    <>
      <section className="relative overflow-hidden bg-diagonal-split">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <p className="text-brand">আমরা আছি আপনার পাশে</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            We are here to help.
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Questions about a product, an order or delivery? Reach us the way
            that suits you.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-7xl px-4">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map(({ Icon, title, value, href, note }) => {
            const body = (
              <>
                <span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand">
                  <Icon size={22} aria-hidden />
                </span>
                <p className="mt-4 font-bold text-navy-900">{title}</p>
                <p className="mt-0.5 break-words text-sm font-medium text-slate-700">
                  {value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{note}</p>
              </>
            );
            const cls =
              "block h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
            return (
              <li key={title}>
                {href ? (
                  <a
                    href={href}
                    className={`${cls} transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md`}
                  >
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mx-auto mt-16 grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_420px]">
        <section>
          <h2 className="text-2xl font-bold text-navy-900">
            Send us a message
          </h2>
          <p className="mb-6 mt-1 text-slate-500">
            Tell us what you need and your mobile number, and we will reply.
          </p>
          <ContactForm />
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy-900">Quick answers</h2>
          <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map(([q, a]) => (
              <details key={q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-navy-900">
                  {q}
                  <span
                    className="text-brand transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-600">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Looking for an order?{" "}
            <Link
              href="/track"
              className="font-semibold text-brand hover:underline"
            >
              Track it here
            </Link>
            .
          </p>
        </section>
      </div>
      <div className="h-4" />
    </>
  );
}
