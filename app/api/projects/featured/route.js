import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import { normalizeBuilder } from "@/utils/admin/normalization";
import UpcomingProject from "@/models/UpcomingProject";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch the 15 most recent projects to support rotating display
    const dbProjects = await UpcomingProject.find({})
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

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
        status: isReady ? "Ready to Move" : "Under Construction",
        specificType:
          p.configuration ||
          (p.bhk && p.bhk.length > 0 ? `${p.bhk.join(", ")} BHK` : p.propertyType || "Residential"),
        locality: p.locality || p.location || "Local",
        city: p.city || "",
        builder: normalizeBuilder(p.builderName),
        possessionYear: p.possessionYear === 0 ? "Ready to Move" : p.possessionYear || p.possessionDate || "TBD",
        superArea: p.superArea ? parseFloat(p.superArea.replace(/,/g, "")) : (p.avgAreaSqft ? parseFloat(p.avgAreaSqft.replace(/,/g, "")) : 0),
        minPrice: p.minPrice || 0,
        maxPrice: p.maxPrice || 0,
        marketPrice: p.marketPrice,
      };
    });

    return NextResponse.json({ success: true, data: mappedProperties }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects/featured:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
