export interface Material {
  _id: string;
  name: string;
  sku: string;
  type: "denim" | "button" | "rivet" | "thread" | "leather" | "zipper" | "other";
  price: number;
  stock: number;
  color: string;
  weightOz: number;
  stretch: string;
  origin: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
