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

// Helper to generate URL-safe slugs for folders
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")         // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start
    .replace(/-+$/, "");            // Trim - from end
}

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

    // Fetch the project to generate the slug folder path
    const project = await MarketProject.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found in database." },
        { status: 404 }
      );
    }

    const projectSlug = slugify(project.projectName || "project");

    // 1. Upload photos to Cloudinary using custom slug folder structure
    const uploadPromises = photos.map(async (base64Photo, index) => {
      const result = await cloudinary.uploader.upload(base64Photo, {
        // Group under Followproperty/projects/[project-slug]/media/images/
        folder: `Followproperty/projects/${projectSlug}/media/images`,
        public_id: `${projectSlug}-${index + 1}`,
        overwrite: true,
        invalidate: true,
      });
      return result.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    // 2. Update coordinates and images array in MongoDB
    project.gps = gps.trim();
    project.images = imageUrls;
    await project.save();

    return NextResponse.json({
      success: true,
      projectId: String(project._id),
      projectName: project.projectName,
      gps: project.gps,
      imagesCount: project.images.length,
    });
  } catch (err) {
    console.error("Error in field-collector/submit API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit coordinates and images." },
      { status: 500 }
    );
  }
}
