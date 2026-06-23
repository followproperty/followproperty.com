import mongoose from "mongoose";

const ChatLeadSchema = new mongoose.Schema(
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
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    intent: {
      type: String,
      enum: ["buy", "sell", "other"],
      required: true,
      index: true
    },
    message: {
      type: String,
      trim: true,
      default: ""
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    chatHistory: [
      {
        sender: {
          type: String,
          enum: ["bot", "user"],
          required: true
        },
        text: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      default: "new",
      index: true
    }
  },
  {
    timestamps: true,
    collection: "chatleads"
  }
);

export default mongoose.models.ChatLead || mongoose.model("ChatLead", ChatLeadSchema);
