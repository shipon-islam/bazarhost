export type Review = {
  id: string;
  name: string;
  location: string;
  rating: number;
  product: string;
  quote: string;
};

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Farhana Akter",
    location: "Dhanmondi, Dhaka",
    rating: 5,
    product: "AirPulse Pro Wireless Earbuds",
    quote:
      "Delivery came the next day and the noise cancelling actually works on the bus. Best earbuds I've bought under ৳3,000.",
  },
  {
    id: "r2",
    name: "Tanvir Ahmed",
    location: "Chattogram",
    rating: 5,
    product: "Handloom Cotton Panjabi",
    quote:
      "Fabric quality felt better in hand than in the photos. Ordered one more for my father in a different colour.",
  },
  {
    id: "r3",
    name: "Nusrat Jahan",
    location: "Sylhet",
    rating: 4,
    product: "ChefLine 5-Piece Cookware Set",
    quote:
      "Non-stick coating is holding up well after a month of daily use. Wish the casserole lid fit a bit tighter, but great value.",
  },
  {
    id: "r4",
    name: "Rakibul Hasan",
    location: "Uttara, Dhaka",
    rating: 5,
    product: "VoltCore 20,000mAh Power Bank",
    quote:
      "Charges my phone almost four times on one trip. Cash on delivery was smooth and the rider called ahead like promised.",
  },
  {
    id: "r5",
    name: "Sharmin Sultana",
    location: "Khulna",
    rating: 5,
    product: "Jamdani Weave Saree",
    quote:
      "Wore it to a wedding and got so many compliments. The blouse piece matched perfectly with the saree.",
  },
  {
    id: "r6",
    name: "Imran Kabir",
    location: "Rajshahi",
    rating: 4,
    product: "Vistalux 43\" Smart LED TV",
    quote:
      "Picture quality is sharp for the price and setup took ten minutes. Customer support helped me mount it over video call.",
  },
];
