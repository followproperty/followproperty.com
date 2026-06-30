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
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json({ success: true, projects: [] });
    }

    await connectToDatabase();

    const projects = await MarketProject.find({
      projectName: { $regex: new RegExp(query.trim(), "i") }
    })
    .select("_id projectName location locality city state gps images status")
    .limit(15)
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
    console.error("Error in field-collector/search API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search projects." },
      { status: 500 }
    );
  }
}
