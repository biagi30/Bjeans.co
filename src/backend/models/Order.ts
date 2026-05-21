import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  itemType: "retail" | "custom";
  product?: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customSpec?: Record<string, any> | null;
}

export interface IOrder extends Document {
  orderNumber: string;
  orderType: "unified" | "retail" | "custom";
  parentOrder?: mongoose.Types.ObjectId | null;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: "waiting_payment" | "processing" | "done" | "shipped";
  paymentStatus: "unpaid" | "paid" | "refunded";
  shippingAddress: string;
  updatedBy?: mongoose.Types.ObjectId | null;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    itemType: {
      type: String,
      enum: ["retail", "custom"],
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    customSpec: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ["unified", "retail", "custom"],
      default: "unified",
    },
    parentOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["waiting_payment", "processing", "done", "shipped"],
      default: "waiting_payment",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    shippingAddress: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
export default Order;
