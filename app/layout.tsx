import FaqChatbot from "@/components/FaqChatbot";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopBar from "@/components/TopBar";
import WhatsappButton from "@/components/WhatsappButton";
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
  title: "BazarHost — আপনার প্রয়োজন, আমাদের বাজার",
  description:
    "BazarHost is Bangladesh's marketplace for electronics, fashion, home & living and more. Shop smart, live better.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <TopBar />
        <Header />
        <main>{children}</main>
        <Footer />
        <FaqChatbot />
        <WhatsappButton />
      </body>
    </html>
  );
}
