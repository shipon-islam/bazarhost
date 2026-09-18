import Newsletter from "@/components/Newsletter";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="relative pt-32 bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 ">
        <Newsletter />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-12 pt-16 sm:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold">
              Bazar<span className="text-orange">Host</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              আপনার প্রয়োজন, আমাদের বাজার। Bangladesh&apos;s marketplace for
              electronics, fashion, home essentials and more.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/90">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>
                <Link href="/electronics">Electronics</Link>
              </li>
              <li>
                <Link href="/fashion">Fashion</Link>
              </li>
              <li>
                <Link href="/home-&-living">Home &amp; Living</Link>
              </li>
              <li>
                <Link href="/and-more">And More</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/90">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>Track your order</li>
              <li>Delivery &amp; returns</li>
              <li>Contact us</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/90">Get in touch</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>
                <a
                  href="mailto:bazarhostbd@gmail.com"
                  className="transition-colors hover:text-white"
                >
                  bazarhostbd@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801829258553"
                  className="transition-colors hover:text-white"
                >
                  +880 1829258553
                </a>
              </li>
              <li>Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BazarHost. All rights reserved.</p>
          <p>Shop Smart, Live Better.</p>
        </div>
      </div>
    </footer>
  );
}
