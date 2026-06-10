// models/MarketProject.js

import mongoose from "mongoose";

const MarketProjectSchema = new mongoose.Schema(
    {
        projectName: { type: String, index: true },
        location: String,
        launchedDate: String,
        launchingPrice: String,
        possessionDate: String,
        builderName: String,
        builderId: { type: mongoose.Schema.Types.ObjectId, ref: "Builder", index: true },
        units: String,
        totalArea: String,
        towers: String,
        apartmentsPerFloor: String,
        configuration: String,
        status: String,
        marketPrice: String,
        perSqftRate: String,
        perSqftRentalAvg: String,
        monthlyRentRange: String,
        superArea: String,
        avgAreaSqft: String,
        gps: String,
        unitSize: String,
        
        // Added for founder-approved project selection
        state: { type: String, index: true },
        city: { type: String, index: true },
        propertyType: { type: String, index: true },

        // --- Additive Structured Fields for Watchlist Matching & Search ---
        locality: { type: String, index: true },       // Clean sector/locality name
        bhk: { type: [Number], index: true },           // Array of numeric BHKs (e.g. [2, 3])
        minPrice: { type: Number, index: true },       // Numeric min price in Rupees
        maxPrice: { type: Number, index: true },       // Numeric max price in Rupees
        minArea: { type: Number },                      // Numeric min area in Sqft
        maxArea: { type: Number },                      // Numeric max area in Sqft
        possessionYear: { type: Number, index: true }, // Four digit numeric year (e.g. 2026, 0 for Ready)
        moderationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved",
            index: true
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
    },
    {
        timestamps: true,
    }
);

// Compound index for extremely fast query matching on State + City + PropertyType + ProjectName prefix
MarketProjectSchema.index({ state: 1, city: 1, propertyType: 1, projectName: 1 });

// Compound index for matching Watchlists on City + Locality + Budget ranges
MarketProjectSchema.index({ city: 1, locality: 1, minPrice: 1, maxPrice: 1 });

export default mongoose.models.MarketProject ||
    mongoose.model("MarketProject", MarketProjectSchema);