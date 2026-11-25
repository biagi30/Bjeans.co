import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProcessedWebhook extends Document {
  webhookId: string;
  messageId?: string;
  status?: string;
  processedAt: Date;
}

const processedWebhookSchema = new Schema<IProcessedWebhook>(
  {
    webhookId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    messageId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30, // Auto-expire setelah 30 hari
    },
  },
  {
    timestamps: true,
  }
);

export const ProcessedWebhook: Model<IProcessedWebhook> =
  mongoose.models.ProcessedWebhook ||
  mongoose.model<IProcessedWebhook>("ProcessedWebhook", processedWebhookSchema);
