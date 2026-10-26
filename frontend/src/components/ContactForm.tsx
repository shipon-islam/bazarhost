"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
const EMAIL = "bazarhostbd@gmail.com";
const topics = [
  "Order help",
  "Product question",
  "Delivery & returns",
  "Something else",
];
const field =
  "w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-300 outline-none focus:ring-brand";

export default function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "mail">(
    "idle",
  );
  const [failed, setFailed] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (v("name").length < 2) errs.name = "Enter your name.";
    if (!/^01[3-9]\d{8}$/.test(v("phone")))
      errs.phone = "Enter an 11-digit mobile number, like 01712345678.";
    if (v("email") && !/^\S+@\S+\.\S+$/.test(v("email")))
      errs.email = "Enter a valid email address.";
    if (v("message").length < 10)
      errs.message = "Tell us a little more (at least 10 characters).";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      name: v("name"),
      phone: v("phone"),
      email: v("email") || undefined,
      topic: v("topic"),
      message: v("message"),
    };
    if (!API) {
      // No backend configured: open the visitor's email app with the message filled in.
      const body = `${payload.message}\n\nName: ${payload.name}\nPhone: ${payload.phone}${payload.email ? `\nEmail: ${payload.email}` : ""}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`[${payload.topic}] from ${payload.name}`)}&body=${encodeURIComponent(body)}`;
      setState("mail");
      return;
    }
    setState("sending");
    setFailed("");
    try {
      // Expected: POST {API}/contact { name, phone, email?, topic, message } -> 2xx
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setState("sent");
    } catch {
      setFailed(
        "We could not send your message. Please call or WhatsApp us instead.",
      );
      setState("idle");
    }
  }

  if (state === "sent" || state === "mail")
    return (
      <div className="rounded-3xl bg-surface p-8 text-center">
        <p className="text-4xl" aria-hidden>
          {state === "sent" ? "✅" : "✉️"}
        </p>
        <h3 className="mt-3 text-xl font-bold text-navy-900">
          {state === "sent"
            ? "Message sent"
            : "Your email app should be opening"}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {state === "sent" ? (
            "Thank you. We will get back to you soon."
          ) : (
            <>
              Send the email to finish. If nothing opened, write to{" "}
              <a className="font-semibold text-brand" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>{" "}
              directly.
            </>
          )}
        </p>
      </div>
    );

  const Err = ({ k }: { k: string }) =>
    errors[k] ? (
      <p role="alert" className="mt-1 text-xs text-red-600">
        {errors[k]}
      </p>
    ) : null;
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1 block text-sm font-medium">
            Your name
          </label>
          <input
            id="c-name"
            name="name"
            autoComplete="name"
            className={field}
          />
          <Err k="name" />
        </div>
        <div>
          <label htmlFor="c-phone" className="mb-1 block text-sm font-medium">
            Mobile number
          </label>
          <input
            id="c-phone"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01712345678"
            className={field}
          />
          <Err k="phone" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-email" className="mb-1 block text-sm font-medium">
            Email (optional)
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            autoComplete="email"
            className={field}
          />
          <Err k="email" />
        </div>
        <div>
          <label htmlFor="c-topic" className="mb-1 block text-sm font-medium">
            What is this about?
          </label>
          <select id="c-topic" name="topic" className={field}>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="c-msg" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea id="c-msg" name="message" rows={5} className={field} />
        <Err k="message" />
      </div>
      {failed && (
        <p role="alert" className="text-sm text-red-600">
          {failed}
        </p>
      )}
      <button
        disabled={state === "sending"}
        className="w-full rounded-xl bg-brand py-3.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
