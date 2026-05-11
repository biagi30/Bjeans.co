export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  type: "retail" | "accessory";
  price: number;
  stock: number;
  sizeOptions: string[];
  shrinkageWarning: string;
  images: string[];
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
