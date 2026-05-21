import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeasurementProfile extends Document {
  user: mongoose.Types.ObjectId;
  waist: number;
  thigh: number;
  calf: number;
  inseam: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const measurementProfileSchema = new Schema<IMeasurementProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    waist: {
      type: Number,
      default: 0,
      min: 0,
    },
    thigh: {
      type: Number,
      default: 0,
      min: 0,
    },
    calf: {
      type: Number,
      default: 0,
      min: 0,
    },
    inseam: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const MeasurementProfile: Model<IMeasurementProfile> =
  mongoose.models.MeasurementProfile ||
  mongoose.model<IMeasurementProfile>(
    "MeasurementProfile",
    measurementProfileSchema
  );
export default MeasurementProfile;
