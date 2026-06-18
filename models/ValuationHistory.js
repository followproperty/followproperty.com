import mongoose from 'mongoose';

const ValuationHistorySchema = new mongoose.Schema(
  {
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: [true, 'Portfolio reference ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference ID is required'],
      index: true,
    },
    valuation: {
      medianRate: {
        type: Number,
        required: [true, 'Median rate is required'],
      },
      currentMarketValue: {
        type: Number,
        required: [true, 'Current market value is required'],
      },
      gain: {
        type: Number,
        required: [true, 'Gain amount is required'],
      },
      gainPct: {
        type: String,
        required: [true, 'Gain percentage is required'],
      },
      projectRate: {
        type: Number,
        default: null,
      },
      comparableRate: {
        type: Number,
        default: null,
      },
      governmentRate: {
        type: Number,
        default: null,
      },
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index to support sorting history by date per portfolio efficiently
ValuationHistorySchema.index({ portfolioId: 1, calculatedAt: -1 });

const ValuationHistory = mongoose.models.ValuationHistory || mongoose.model('ValuationHistory', ValuationHistorySchema);

export default ValuationHistory;
