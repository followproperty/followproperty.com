import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";
import { normalizeBuilder } from "@/utils/admin/normalization";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "market";
    const cityParam = searchParams.get("city") || "All";
    const builderParam = searchParams.get("builder") || "All";
    const propertyTypeParam = searchParams.get("propertyType") || "All";
    const statusParam = searchParams.get("status") || "All";

    // Build Mongoose query
    const query = {};

    if (cityParam !== "All") {
      query.city = cityParam;
    }

    if (builderParam !== "All") {
      // Get all unique builder names to find matches with casing variations
      const [marketBuilders, upcomingBuilders] = await Promise.all([
        MarketProject.distinct("builderName"),
        UpcomingProject.distinct("builderName")
      ]);
      const rawBuilders = Array.from(new Set([...marketBuilders, ...upcomingBuilders]));
      const matchingRawNames = rawBuilders.filter(
        (name) => name && normalizeBuilder(name) === builderParam
      );
      query.builderName = { $in: matchingRawNames };
    }

    if (propertyTypeParam !== "All") {
      query.propertyType = propertyTypeParam;
    }

    if (statusParam !== "All") {
      query.status = statusParam;
    }

    let dbProjects = [];

    if (type === "upcoming") {
      dbProjects = await UpcomingProject.find(query)
        .sort({ createdAt: -1 })
        .lean();
    } else {
      dbProjects = await MarketProject.find(query)
        .sort({ createdAt: -1 })
        .lean();
    }

    // Map DB records to clean PropertyCard format
    const mappedProperties = dbProjects.map((p) => {
      const isReady =
        p.status === "Ready" ||
        p.status === "Ready to Move" ||
        p.status === "Completed";

      return {
        id: p._id.toString(),
        _id: p._id.toString(),
        title: p.projectName,
        projectName: p.projectName,
        status: p.status === "Upcoming" ? "Upcoming" : (isReady ? "Ready to Move" : "Under Construction"),
        specificType:
          p.configuration ||
          (p.bhk && p.bhk.length > 0 ? `${p.bhk.join(", ")} BHK` : p.propertyType || "Residential"),
        locality: p.locality || p.location || "Local",
        city: p.city || "",
        builder: normalizeBuilder(p.builderName || ""),
        possessionYear: p.possessionYear === 0 ? "Ready to Move" : p.possessionYear || p.possessionDate || "TBD",
        superArea: p.superArea
          ? parseFloat(String(p.superArea).replace(/,/g, "")) || 0
          : p.avgAreaSqft
          ? parseFloat(String(p.avgAreaSqft).replace(/,/g, "")) || 0
          : 0,
        minPrice: p.minPrice || 0,
        maxPrice: p.maxPrice || 0,
        marketPrice: p.marketPrice,
        images: p.images || [],
        image: p.images && p.images.length > 0 ? p.images[0] : "",
      };
    });

    return NextResponse.json({ success: true, data: mappedProperties }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects/list:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error occurred" },
      { status: 500 }
    );
  }
}
