import Link from "next/link";

// wa.me expects the number in international format with no "+", spaces, or
// leading zeros — e.g. Bangladesh 01XXX-XXXXXX becomes 8801XXXXXXXXX.
const WHATSAPP_NUMBER = "8801829258553";
const PREFILLED_MESSAGE = "Hi BazarHost, I have a question about a product.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    PREFILLED_MESSAGE,
  )}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with BazarHost on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-ink/20 transition-transform hover:scale-105 focus-visible:outline-offset-4"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M17.47 14.38c-.29-.15-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.15-.19.29-.75.93-.92 1.12-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.58-.9-2.16-.24-.58-.48-.5-.65-.5-.17-.01-.36-.01-.56-.01-.19 0-.51.07-.78.36-.26.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.19 2.06 3.15 5 4.42.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34z" />
        <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.9.52 3.66 1.42 5.18L2 22l4.94-1.3A9.95 9.95 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2zm0 18.1c-1.7 0-3.29-.47-4.65-1.28l-.33-.2-3.13.82.84-3.05-.22-.32A8.1 8.1 0 0 1 3.9 12c0-4.48 3.64-8.12 8.12-8.12S20.14 7.52 20.14 12s-3.64 8.1-8.12 8.1z" />
      </svg>
    </Link>
  );
}
