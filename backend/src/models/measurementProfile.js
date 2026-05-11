const mongoose = require("mongoose");

const measurementProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    waist: {
      type: Number,
      default: 0,
      min: 0
    },
    thigh: {
      type: Number,
      default: 0,
      min: 0
    },
    calf: {
      type: Number,
      default: 0,
      min: 0
    },
    inseam: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.MeasurementProfile || mongoose.model("MeasurementProfile", measurementProfileSchema);
