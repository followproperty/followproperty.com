import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'builder'],
      default: 'user',
    },
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Builder',
      default: null,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      trim: true,
      default: '',
    },
    occupation: {
      type: String,
      trim: true,
      default: '',
    },
    annualFamilyIncome: {
      type: String,
      trim: true,
      default: '',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
