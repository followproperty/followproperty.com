import mongoose from "mongoose";

const CircleRateSchema = new mongoose.Schema(
  {
    stateCode: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    tehsil: {
      type: String,
      index: true,
      trim: true,
    },
    locality: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    circleRate: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "INR_PER_SQFT",
    },
    originalRate: {
      type: Number,
    },
    originalUnit: {
      type: String,
    },
    landUse: {
      type: String,
      enum: ["Residential", "Commercial", "Agricultural"],
      default: "Residential",
    },
    confidence: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "high",
    },
  },
  {
    timestamps: true,
    collection: "circle_rates",
  }
);

// Compound index for efficient spatial-rate lookups
CircleRateSchema.index({ stateCode: 1, district: 1, locality: 1 });

export default mongoose.models.CircleRate || mongoose.model("CircleRate", CircleRateSchema);
