import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const locality = searchParams.get("locality");

    if (!locality) {
      return NextResponse.json(
        { success: false, error: "Locality is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const projects = await MarketProject.find({
      locality: { $regex: new RegExp(`^${locality.trim()}$`, "i") }
    })
    .select("_id projectName location locality city state gps images status")
    .sort({ projectName: 1 })
    .lean();

    const formatted = projects.map((p) => ({
      _id: String(p._id),
      projectName: p.projectName || "Unnamed Project",
      location: p.location || "",
      locality: p.locality || "",
      city: p.city || "",
      state: p.state || "",
      gps: p.gps || "",
      images: p.images || [],
      status: p.status || "Unknown",
      isCompleted: !!(p.gps && p.images && p.images.length >= 4),
    }));

    return NextResponse.json({
      success: true,
      projects: formatted
    });
  } catch (err) {
    console.error("Error in field-collector/projects list API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load projects for locality." },
      { status: 500 }
    );
  }
}
