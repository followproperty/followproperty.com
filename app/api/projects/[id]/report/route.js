import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";
import { generateProjectReportPDF } from "@/utils/pdf/templates/projectReport";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const unwrappedParams = await params;
    const id = unwrappedParams.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Project ID is required." },
        { status: 400 }
      );
    }

    // Query live MarketProject data with fallback to UpcomingProject
    let project = await MarketProject.findById(id).lean();
    if (!project) {
      project = await UpcomingProject.findById(id).lean();
    }

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found." },
        { status: 404 }
      );
    }

    // Generate the PDF report
    const pdfBuffer = generateProjectReportPDF(project);

    // Create a clean filename: builder_project_name_report.pdf
    const cleanProjectName = (project.projectName || "project").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const filename = `${cleanProjectName}_report.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Error in GET /api/projects/[id]/report:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
