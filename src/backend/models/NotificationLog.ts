import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationLog extends Document {
  messageId: string;
  webhookId?: string;
  channel: "EMAIL" | "WHATSAPP" | "BROADCAST" | string;
  recipient: string;
  templateCode?: string;
  variables?: Record<string, any>;
  status: "QUEUED" | "PENDING" | "SENT" | "DELIVERED" | "FAILED" | string;
  errorMessage?: string | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    webhookId: {
      type: String,
      sparse: true,
      index: true,
      trim: true,
    },
    channel: {
      type: String,
      required: true,
      trim: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
    },
    templateCode: {
      type: String,
      trim: true,
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      required: true,
      default: "QUEUED",
      trim: true,
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases untuk snake_case compatibility
notificationLogSchema.virtual("message_id").get(function () {
  return this.messageId;
});

notificationLogSchema.virtual("error_message").get(function () {
  return this.errorMessage;
});

export const NotificationLog: Model<INotificationLog> =
  mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>("NotificationLog", notificationLogSchema);
