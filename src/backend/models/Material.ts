import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaterial extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>(
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
    type: {
      type: String,
      enum: ["denim", "button", "rivet", "thread", "leather", "zipper", "other"],
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      default: "",
    },
    weightOz: {
      type: Number,
      default: 0,
      min: 0,
    },
    stretch: {
      type: String,
      default: "",
    },
    origin: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
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

export const Material: Model<IMaterial> =
  mongoose.models.Material ||
  mongoose.model<IMaterial>("Material", materialSchema);
export default Material;
