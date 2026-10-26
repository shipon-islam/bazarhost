export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  supportPhone: string;
  websiteUrl: string;
  timezone: string;
  currency: string;
  logo: string | null;
  defaultLanguage: "en" | "bn";
  weightUnit: "kg" | "g";
  defaultOrderStatus: "pending" | "processing";
  lowStockThreshold: number;
  notifications: {
    newOrderEmail: boolean;
    newOrderSms: boolean;
    lowStockEmail: boolean;
    weeklySummaryEmail: boolean;
  };
}
