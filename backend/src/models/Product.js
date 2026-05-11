const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["retail", "accessory"],
      default: "retail"
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    sizeOptions: {
      type: [String],
      default: []
    },
    shrinkageWarning: {
      type: String,
      default: ""
    },
    images: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: ""
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

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
