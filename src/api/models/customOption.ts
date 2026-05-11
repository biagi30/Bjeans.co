export interface CustomOption {
  _id: string;
  type: "fabric" | "model" | "detail" | "wash" | "fit" | "other";
  name: string;
  description: string;
  priceDelta: number;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
