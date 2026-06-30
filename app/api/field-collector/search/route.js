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

    const searchQuery = query.trim();

    // OPTIMIZATION: 1. Try prefix search first (utilizes indexes extremely fast)
    let projects = await MarketProject.find({
      $or: [
        { projectName: { $regex: new RegExp("^" + searchQuery, "i") } },
        { locality: { $regex: new RegExp("^" + searchQuery, "i") } }
      ]
    })
    .select("_id projectName location locality city state gps images status")
    .limit(20)
    .lean();

    // 2. Fallback to contains search only if we found fewer than 6 projects
    if (projects.length < 6) {
      const existingIds = projects.map((p) => p._id);
      const additional = await MarketProject.find({
        $or: [
          { projectName: { $regex: new RegExp(searchQuery, "i") } },
          { locality: { $regex: new RegExp(searchQuery, "i") } }
        ],
        _id: { $nin: existingIds }
      })
      .select("_id projectName location locality city state gps images status")
      .limit(20 - projects.length)
      .lean();

      projects = [...projects, ...additional];
    }

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
