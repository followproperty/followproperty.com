import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    await connectToDatabase();

    // Try finding the project in MarketProject collection first
    let project = await MarketProject.findById(id).select("builderSlug projectSlug").lean();
    
    // Fallback to UpcomingProject collection
    if (!project) {
      project = await UpcomingProject.findById(id).select("builderSlug projectSlug").lean();
    }

    if (project && project.builderSlug && project.projectSlug) {
      const targetUrl = new URL(
        `/builder/${project.builderSlug}/projects/${project.projectSlug}`,
        request.url
      );
      
      // Preserve search parameters like watchlistId
      const { searchParams } = new URL(request.url);
      searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
      });

      return NextResponse.redirect(targetUrl, 301); // 301 Moved Permanently
    }
  } catch (error) {
    console.error(`Error processing redirect for legacy ID ${id}:`, error);
  }

  // Graceful 404 response if not found or lookup failed
  return new NextResponse("Project Not Found", { status: 404 });
}
