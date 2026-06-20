import mongoose from "mongoose";

const VoiceLeadSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit phone number!`
      },
      index: true
    },
    audioUrl: {
      type: String,
      trim: true,
      default: ""
    },
    rawRequirement: {
      type: String,
      trim: true,
      default: ""
    },
    city: {
      type: String,
      trim: true,
      default: ""
    },
    locality: {
      type: String,
      trim: true,
      default: ""
    },
    propertyType: {
      type: String,
      trim: true,
      default: ""
    },
    bhk: {
      type: String,
      trim: true,
      default: ""
    },
    budget: {
      type: String,
      trim: true,
      default: ""
    },
    purpose: {
      type: String,
      trim: true,
      default: ""
    },
    language: {
      type: String,
      trim: true,
      default: ""
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      default: "qr_voice",
      index: true
    },
    status: {
      type: String,
      default: "new",
      index: true
    },
    reviewNeeded: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.VoiceLead || mongoose.model("VoiceLead", VoiceLeadSchema);
