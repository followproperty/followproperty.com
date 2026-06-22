import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "projectModel",
      index: true,
    },
    projectModel: {
      type: String,
      enum: ["MarketProject", "UpcomingProject"],
      default: "MarketProject",
    },
    watchlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Watchlist",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query performance
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Compound unique index to prevent duplicate notifications for a specific watchlist-project pair
NotificationSchema.index(
  { watchlistId: 1, projectId: 1 },
  { unique: true, sparse: true }
);

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;
