import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    // Authenticate request
    const apiKey = req.headers.get("authorization")?.split("Bearer ")[1];
    const expectedApiKey = process.env.FIELD_COLLECTOR_API_KEY || "fp_field_collector_secret_2026_x92";
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, gps, photos } = await req.json();

    if (!projectId || !gps) {
      return NextResponse.json(
        { success: false, error: "Project ID and GPS coordinates are required." },
        { status: 400 }
      );
    }

    if (!photos || !Array.isArray(photos) || photos.length < 4) {
      return NextResponse.json(
        { success: false, error: "At least 4 photographs are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Upload photos to Cloudinary using the official SDK
    const uploadPromises = photos.map(async (base64Photo) => {
      const result = await cloudinary.uploader.upload(base64Photo, {
        folder: "Followproperty/projects/field-collector",
      });
      return result.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    // 2. Update coordinates and images array in MongoDB
    const updated = await MarketProject.findByIdAndUpdate(
      projectId,
      {
        $set: {
          gps: gps.trim(),
          images: imageUrls,
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Project not found in database." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      projectId: String(updated._id),
      projectName: updated.projectName,
      gps: updated.gps,
      imagesCount: updated.images.length,
    });
  } catch (err) {
    console.error("Error in field-collector/submit API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit coordinates and images." },
      { status: 500 }
    );
  }
}
