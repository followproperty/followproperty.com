import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    referrerName: {
      type: String,
      required: [true, "Referrer name is required"],
      trim: true,
    },
    referrerPhone: {
      type: String,
      required: [true, "Referrer phone number is required"],
      trim: true,
    },
    referrals: [
      {
        name: {
          type: String,
          required: [true, "Referral name is required"],
          trim: true,
        },
        phone: {
          type: String,
          required: [true, "Referral phone number is required"],
          trim: true,
        },
      }
    ],
    projectName: {
      type: String,
      default: "BPTP Downtown",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "purchased", "rewarded"],
      default: "pending",
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);
