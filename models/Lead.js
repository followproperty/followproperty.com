import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketProject",
      default: null,
      index: true,
    },
    projectName: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      enum: ["landing", "brochure_download"],
      default: "landing",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    requirements: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
