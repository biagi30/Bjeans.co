const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["denim", "button", "rivet", "thread", "leather", "zipper", "other"],
      required: true
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    color: {
      type: String,
      default: ""
    },
    weightOz: {
      type: Number,
      default: 0,
      min: 0
    },
    stretch: {
      type: String,
      default: ""
    },
    origin: {
      type: String,
      default: ""
    },
    images: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Material || mongoose.model("Material", materialSchema);
