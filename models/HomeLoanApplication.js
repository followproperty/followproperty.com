import mongoose from "mongoose";

const HomeLoanApplicationSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: [true, "Lead ID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    emailAddress: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    propertyPurpose: {
      type: String,
      required: [true, "Property purpose is required"],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      trim: true,
    },
    builder: {
      type: String,
      trim: true,
      default: "",
    },
    project: {
      type: String,
      trim: true,
      default: "",
    },
    propertyValue: {
      type: Number,
      required: [true, "Property value is required"],
    },
    propertyStatus: {
      type: String,
      trim: true,
      default: "",
    },
    requiredLoanAmount: {
      type: Number,
      required: [true, "Required loan amount is required"],
    },
    downPaymentAvailable: {
      type: Number,
      default: 0,
    },
    preferredLoanTenure: {
      type: Number,
      default: null,
    },
    preferredBank: {
      type: String,
      trim: true,
      default: "",
    },
    preferredInterestRate: {
      type: Number,
      default: null,
    },
    employmentType: {
      type: String,
      required: [true, "Employment type is required"],
      trim: true,
    },
    monthlyNetIncome: {
      type: Number,
      required: [true, "Monthly net income is required"],
    },
    totalWorkExperience: {
      type: String,
      required: [true, "Total work experience is required"],
      trim: true,
    },
    employerOrBusinessName: {
      type: String,
      required: [true, "Employer or business name is required"],
      trim: true,
    },
    existingMonthlyEmi: {
      type: Number,
      default: 0,
    },
    existingHomeLoan: {
      type: Boolean,
      required: [true, "Existing home loan status is required"],
      default: false,
    },
    existingHomeLoanDetails: {
      type: String,
      default: null,
    },
    existingHomeLoanOutstanding: {
      type: Number,
      default: null,
    },
    existingHomeLoanBank: {
      type: String,
      default: null,
    },
    coApplicant: {
      type: Boolean,
      required: [true, "Co-applicant status is required"],
      default: false,
    },
    coApplicantMonthlyIncome: {
      type: Number,
      default: null,
    },
    approximateCreditScore: {
      type: String,
      required: [true, "Approximate credit score is required"],
      enum: ["750+", "700-749", "650-699", "UNDER_650", "UNKNOWN"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Application status is required"],
      enum: ["NEW", "CONTACTED", "DOCUMENT_PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED"],
      default: "NEW",
      index: true,
    },
    assignedTo: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "homeloanswithcashback",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    metadata: {
      device: { type: String, default: "desktop" },
      browser: { type: String, default: "unknown" },
      submittedFrom: { type: String, default: "/homeloanswithcashback" }
    }
  },
  {
    timestamps: true,
  }
);

// Create compound index for sorting leads by creation date
HomeLoanApplicationSchema.index({ createdAt: -1 });

// Prevent Next.js hot-reloading from serving a stale compiled model schema from memory cache
if (mongoose.models.HomeLoanApplication) {
  delete mongoose.models.HomeLoanApplication;
}

export default mongoose.model("HomeLoanApplication", HomeLoanApplicationSchema);
