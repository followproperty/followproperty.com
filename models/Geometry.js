import mongoose from "mongoose";

const GeometrySchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["state", "district", "tehsil", "locality"],
      required: true,
      index: true,
    },
    stateCode: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    district: {
      type: String,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Polygon", "MultiPolygon"],
        required: true,
      },
      coordinates: {
        type: Array,
        required: true,
      },
    },
  },
  {
    timestamps: true,
    collection: "geometries",
  }
);

// Compound index for fast map query lookups
GeometrySchema.index({ level: 1, stateCode: 1, district: 1 });

export default mongoose.models.Geometry || mongoose.model("Geometry", GeometrySchema);
