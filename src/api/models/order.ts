export interface OrderItem {
  itemType: "retail" | "custom";
  product: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customSpec: Record<string, unknown> | null;
}

export interface Order {
  _id: string;
  orderNumber: string;
  orderType: "unified" | "retail" | "custom";
  parentOrder: string | null;
  customer: string;
  items: OrderItem[];
  status: "waiting_payment" | "processing" | "done" | "shipped";
  paymentStatus: "unpaid" | "paid" | "refunded";
  shippingAddress: string;
  updatedBy: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
