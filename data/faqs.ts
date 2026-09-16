export type Faq = {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
};

export const faqs: Faq[] = [
  {
    id: "delivery-time",
    question: "How long does delivery take?",
    keywords: ["delivery", "shipping", "arrive", "days", "when"],
    answer:
      "Most orders inside Dhaka arrive within 1–2 business days. Outside Dhaka, expect 3–5 business days. You'll get a call from our rider before delivery.",
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    keywords: ["payment", "pay", "bkash", "nagad", "cod", "cash"],
    answer:
      "We accept Cash on Delivery, bKash, and Nagad. You'll choose your preferred method on the order details page before confirming.",
  },
  {
    id: "how-to-order",
    question: "How do I place an order?",
    keywords: ["order", "buy", "purchase", "how"],
    answer:
      'Tap "Order now" on any product card, fill in your delivery details on the next page, choose a payment method, and confirm — that\'s it.',
  },
  {
    id: "return-policy",
    question: "What is your return policy?",
    keywords: ["return", "refund", "exchange", "policy"],
    answer:
      "Most items can be returned within 3 days of delivery if unused and in original packaging. Message us on WhatsApp with your order number to start a return.",
  },
  {
    id: "track-order",
    question: "How can I track my order?",
    keywords: ["track", "status", "where is my order"],
    answer:
      'Use the "Track order" link at the top of the page, or message us on WhatsApp with your order number and we\'ll check the status for you.',
  },
  {
    id: "delivery-fee",
    question: "How much is the delivery fee?",
    keywords: ["fee", "cost", "charge", "free delivery"],
    answer:
      "Delivery is ৳80 flat, and free on orders over ৳2,000 anywhere in Bangladesh.",
  },
];
