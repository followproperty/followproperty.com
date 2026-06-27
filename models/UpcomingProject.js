import mongoose from "mongoose";
import { CITIES } from "../constants/admin/cities.js";
import { generateBuilderSlug, generateProjectSlug } from "../utils/admin/normalization.js";

const UpcomingProjectSchema = new mongoose.Schema(
    {
        // --- Display Mappings (congruent with original Excel fields for UI rendering) ---
        projectName: { 
            type: String, 
            required: [true, "Project name is required"], 
            trim: true,
            index: true 
        },
        builderName: { 
            type: String, 
            required: [true, "Builder name is required"], 
            trim: true 
        },
        location: { 
            type: String, 
            required: [true, "Full location address is required"], 
            trim: true 
        },
        launchedDate: { type: String, default: "" },
        launchingPrice: { type: String, default: "" },
        possessionDate: { type: String, default: "" },
        units: { type: String, default: "" },
        totalArea: { type: String, default: "" },
        towers: { type: String, default: "" },
        apartmentsPerFloor: { type: String, default: "" },
        configuration: { type: String, required: true }, // e.g. "3, 4 BHK"
        status: { 
            type: String, 
            required: true,
            enum: {
                values: ["Ready to Move", "Under Construction"],
                message: "{VALUE} is not a valid project status"
            }
        },
        marketPrice: { type: String, required: true }, // e.g. "3.5 Cr - 7 Cr"
        perSqftRate: { type: String, default: "" },
        perSqftRentalAvg: { type: String, default: "" },
        monthlyRentRange: { type: String, default: "" },
        superArea: { type: String, required: true }, // e.g. "1,800 - 2,800"
        avgAreaSqft: { type: String, default: "" },
        gps: { type: String, default: "" },
        unitSize: { type: String, default: "" },
        
        // --- Categorization & Scalable Handling ---
        state: { type: String, required: [true, "State is required"], index: true },
        city: { 
            type: String, 
            required: [true, "City is required"], 
            index: true,
            validate: {
                validator: function(v) {
                    return CITIES.includes(v);
                },
                message: props => `${props.value} is not a supported canonical city!`
            }
        },
        propertyType: { 
            type: String, 
            required: [true, "Property Type is required"], 
            index: true,
            enum: {
                values: ["Residential", "Commercial", "Plot", "Farmhouse", "Industrial"],
                message: "{VALUE} is not a valid property type"
            }
        },

        // --- Structured Metric Fields for Matching Engines ---
        locality: { 
            type: String, 
            required: [true, "Locality/Sector is required"], 
            index: true,
            trim: true
        },
        bhk: { 
            type: [Number], 
            required: [true, "BHK values array is required"],
            index: true 
        }, 
        
        minPrice: { 
            type: Number, 
            required: [true, "Minimum price is required"], 
            index: true 
        }, // In absolute Rupees
        maxPrice: { 
            type: Number, 
            required: [true, "Maximum price is required"], 
            index: true 
        }, // In absolute Rupees
        
        minArea: { type: Number, required: [true, "Minimum area is required"] }, // Sqft
        maxArea: { type: Number, required: [true, "Maximum area is required"] }, // Sqft
        
        possessionYear: { 
            type: Number, 
            required: [true, "Possession year is required"], 
            index: true 
        }, // e.g. 2028 (0 for Ready)

        // --- Audit & Migration Indicators ---
        projectSource: { 
            type: String, 
            required: true, 
            default: "upcoming", 
            index: true 
        },
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "Creator reference ID is required"] 
        },
        createdByEmail: { 
            type: String, 
            required: [true, "Creator email is required"],
            trim: true
        },
        projectPdf: {
            type: String,
            default: ""
        },
        images: {
            type: [String],
            default: []
        },
        videos: {
            type: [String],
            default: []
        },
        builderId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Builder", 
            index: true 
        },
        builderSlug: {
            type: String,
            trim: true,
            index: true
        },
        projectSlug: {
            type: String,
            trim: true,
            index: true
        }
    },
    {
        timestamps: true,
    }
);

// Enforce duplicate prevention at database index level
UpcomingProjectSchema.index({ projectName: 1, builderName: 1, city: 1 }, { unique: true });

// Optimized compound index for matching watchlist preferences
UpcomingProjectSchema.index({ city: 1, locality: 1, minPrice: 1, maxPrice: 1 });

// Compound unique index for builder slug + project slug (using sparse to allow null/undefined values in migration phase)
UpcomingProjectSchema.index({ builderSlug: 1, projectSlug: 1 }, { unique: true, sparse: true });

// Pre-save hook to auto-populate builder and project slugs with uniqueness resolution
UpcomingProjectSchema.pre("save", async function () {
    if (this.isModified("builderName") || !this.builderSlug) {
        this.builderSlug = generateBuilderSlug(this.builderName);
    }
    
    if (this.isModified("projectName") || this.isModified("city") || !this.projectSlug) {
        const baseSlug = generateProjectSlug(this.projectName);
        let candidateSlug = baseSlug;
        let attempt = 0;
        
        const Model = this.constructor;
        
        while (true) {
            const existing = await Model.findOne({
                builderSlug: this.builderSlug,
                projectSlug: candidateSlug,
                _id: { $ne: this._id }
            }).lean();
            
            if (!existing) {
                break;
            }
            
            attempt++;
            if (attempt === 1 && this.city) {
                const citySlug = this.city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                candidateSlug = `${baseSlug}-${citySlug}`;
            } else if (this.city) {
                const citySlug = this.city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                candidateSlug = `${baseSlug}-${citySlug}-${attempt}`;
            } else {
                candidateSlug = `${baseSlug}-${attempt}`;
            }
        }
        
        this.projectSlug = candidateSlug;
    }
});

export default mongoose.models.UpcomingProject ||
    mongoose.model("UpcomingProject", UpcomingProjectSchema);
