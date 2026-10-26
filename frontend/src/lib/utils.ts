export const formatBDT = (n: number) => `৳${n.toLocaleString("en-US")}`;
export const discountPct = (price: number, sale?: number) =>
  sale && sale < price ? Math.round(((price - sale) / price) * 100) : 0;
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
