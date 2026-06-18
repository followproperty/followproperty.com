import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const propertyType = searchParams.get("propertyType");
    const search = searchParams.get("search") || "";

    // Validation
    if (!state || !city || !propertyType) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: state, city, propertyType" },
        { status: 400 }
      );
    }

    // Standard requirement: minimum 2 characters before search starts
    if (search && search.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Build query utilizing compound index { state, city, propertyType, projectName }
    const query = {
      state: { $regex: new RegExp(`^${state}$`, "i") },
      city: { $regex: new RegExp(`^${city}$`, "i") },
      propertyType: { $regex: new RegExp(`^${propertyType}$`, "i") }
    };

    if (search) {
      // Case-insensitive match on projectName prefix or contains
      query.projectName = { $regex: new RegExp(search.trim(), "i") };
    }

    // Fetch only essential fields to minimize browser memory footprint
    const projects = await MarketProject.find(query)
      .select("projectName builderName location propertyType city state builderId projectSlug builderSlug")
      .limit(10)
      .lean();

    // Sort by relevance: matching prefix first, then alphabetically
    const searchLower = search.trim().toLowerCase();
    projects.sort((a, b) => {
      const aName = (a.projectName || "").toLowerCase();
      const bName = (b.projectName || "").toLowerCase();
      
      const aStartsWith = aName.startsWith(searchLower);
      const bStartsWith = bName.startsWith(searchLower);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return aName.localeCompare(bName);
    });

    return NextResponse.json({ success: true, data: projects }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects/search:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
