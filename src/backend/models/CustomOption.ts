import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomOption extends Document {
  type: "fabric" | "model" | "detail" | "wash" | "fit" | "other";
  name: string;
  description: string;
  priceDelta: number;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customOptionSchema = new Schema<ICustomOption>(
  {
    type: {
      type: String,
      enum: ["fabric", "model", "detail", "wash", "fit", "other"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    priceDelta: {
      type: Number,
      default: 0,
    },
    image: {
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

export const CustomOption: Model<ICustomOption> =
  mongoose.models.CustomOption ||
  mongoose.model<ICustomOption>("CustomOption", customOptionSchema);
export default CustomOption;
