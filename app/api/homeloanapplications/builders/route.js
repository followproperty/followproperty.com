import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch unique builderName and projectName pairs from both collections in parallel
    const [marketProjects, upcomingProjects] = await Promise.all([
      MarketProject.find({}, "builderName projectName").lean(),
      UpcomingProject.find({}, "builderName projectName").lean()
    ]);
    
    const allItems = [...marketProjects, ...upcomingProjects];
    
    // Group projects by builderName
    const builderMap = {};
    allItems.forEach(item => {
      const bName = (item.builderName || "").trim();
      const pName = (item.projectName || "").trim();
      
      if (!bName || !pName) return;
      
      if (!builderMap[bName]) {
        builderMap[bName] = new Set();
      }
      builderMap[bName].add(pName);
    });
    
    // Format to a clean sorted list of builders and their projects
    const result = Object.keys(builderMap).sort().map(builder => ({
      builder,
      projects: Array.from(builderMap[builder]).sort()
    }));
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching builders and projects list for Home Loans:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load builders." }, { status: 500 });
  }
}
