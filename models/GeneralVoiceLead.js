import mongoose from "mongoose";
const Schema = mongoose.Schema;

const GeneralVoiceLeadSchema = new Schema(
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
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
    },
    leadType: {
      type: String,
      default: "general",
      index: true
    }
  },
  {
    timestamps: true,
    collection: "generalvoiceleads" // Explicitly define separate collection name
  }
);

export default mongoose.models.GeneralVoiceLead || mongoose.model("GeneralVoiceLead", GeneralVoiceLeadSchema);
