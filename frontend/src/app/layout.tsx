import Footer from "@/components/shop/Footer";
import Header from "@/components/shop/Header";
import { CartProvider } from "@/lib/cart";
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bazarhost.com"),
  title: {
    default: "BazarHost — আপনার প্রয়োজন, আমাদের বাজার",
    template: "%s | BazarHost",
  },
  description:
    "Bangladesh's marketplace for electronics, fashion, home & living and more. Shop smart, live better.",
  openGraph: { siteName: "BazarHost", locale: "bn_BD", type: "website" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="bg-white font-inter text-slate-800 antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <a
            href="https://wa.me/8801829258553?text=Hi%20BazarHost%2C%20I%20have%20a%20question%20about%20a%20product."
            aria-label="Chat on WhatsApp"
            className="fixed bottom-5 right-5 z-40 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-95"
          >
            WhatsApp
          </a>
        </CartProvider>
      </body>
    </html>
  );
}
