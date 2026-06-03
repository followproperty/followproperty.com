import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference ID is required'],
    },
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      index: true,
    },
    mainCategory: {
      type: String,
      required: [true, 'Main category is required'],
      trim: true,
    },
    specificType: {
      type: String,
      required: [true, 'Specific type is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      validate: {
        validator: (val) => val > 0,
        message: 'Budget must be a positive number greater than zero',
      },
    },
    preApprovedBank: {
      type: String,
      trim: true,
    },
    loanAmount: {
      type: Number,
    },
    downPayment: {
      type: Number,
    },
    possessionYear: {
      type: String,
      trim: true,
    },
    preferredBuilder: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Prevent mongoose from recreating the model on hot reloads
const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema);

export default Watchlist;
