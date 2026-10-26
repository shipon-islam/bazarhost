// TODO: confirm real delivery rules with the business. These are placeholder values.
export const FREE_SHIPPING_OVER = 2000;
export const shippingFee = (subtotal: number, district: string) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : district === "Dhaka" ? 70 : 120;
export const districts = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh", "Other"];
