const mongoose = require("mongoose");

const customOptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["fabric", "model", "detail", "wash", "fit", "other"],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    priceDelta: {
      type: Number,
      default: 0
    },
    image: {
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

module.exports = mongoose.models.CustomOption || mongoose.model("CustomOption", customOptionSchema);
