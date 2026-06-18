import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductSize {
  size: string;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  sku: string;
  category: string;
  type: "retail" | "accessory";
  price: number;
  stock: number;
  sizes?: IProductSize[];
  sizeOptions: string[];
  shrinkageWarning: string;
  images: string[];
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["retail", "accessory"],
      default: "retail",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sizes: {
      type: [
        {
          size: { type: String, required: true },
          stock: { type: Number, default: 0, min: 0 }
        }
      ],
      default: [],
    },
    sizeOptions: {
      type: [String],
      default: [],
    },
    shrinkageWarning: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
export default Product;
