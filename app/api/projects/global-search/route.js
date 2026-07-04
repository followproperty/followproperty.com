import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const searchQuery = query.trim();
    const regex = new RegExp(searchQuery, "i");

    // Query both collections in parallel to cover all site projects
    const [marketProjects, upcomingProjects] = await Promise.all([
      MarketProject.find({
        $or: [
          { projectName: regex },
          { builderName: regex },
          { locality: regex }
        ]
      })
      .select("projectName builderName locality city projectSlug builderSlug")
      .limit(10)
      .lean(),
      UpcomingProject.find({
        $or: [
          { projectName: regex },
          { builderName: regex },
          { locality: regex }
        ]
      })
      .select("projectName builderName locality city projectSlug builderSlug")
      .limit(10)
      .lean()
    ]);

    // Format and combine results
    const combined = [];
    const seen = new Set();

    const addProjects = (projects, type) => {
      for (const p of projects) {
        if (!p.projectSlug || !p.builderSlug) continue;

        const uniqueKey = `${p.builderSlug}/${p.projectSlug}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          combined.push({
            id: p._id.toString(),
            projectName: p.projectName,
            builderName: p.builderName,
            locality: p.locality || "",
            city: p.city || "",
            projectSlug: p.projectSlug,
            builderSlug: p.builderSlug,
            type: type
          });
        }
      }
    };

    addProjects(marketProjects, "market");
    addProjects(upcomingProjects, "upcoming");

    // Limit overall recommendations to 10 items for a clean dropdown
    const results = combined.slice(0, 10);

    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects/global-search:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
