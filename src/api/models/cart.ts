export interface CartItem {
  itemType: "retail" | "custom";
  product: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customSpec: Record<string, unknown> | null;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
