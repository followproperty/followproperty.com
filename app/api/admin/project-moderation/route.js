import { verifyAdminRequest } from "@/lib/admin/admin-guards";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";
import { NextResponse } from "next/server";

// GET: Retrieve all builder projects with moderationStatus = "pending"
export async function GET(req) {
  try {
    const adminCheck = await verifyAdminRequest();
    if (!adminCheck.admin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || "Forbidden" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Query pending projects sorted by latest first
    const projectsDocs = await MarketProject.find({ moderationStatus: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    // Map Mongoose _id and dates to plain serializable formats
    const data = projectsDocs.map((p) => ({
      id: p._id.toString(),
      builderSlug: p.builderSlug || "",
      projectSlug: p.projectSlug || "",
      projectName: p.projectName,
      builderName: p.builderName || "Unknown",
      city: p.city || "",
      propertyType: p.propertyType || "Residential",
      createdAt: p.createdAt ? p.createdAt.toISOString() : null
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/project-moderation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}

// POST: Update project moderation status (Approve/Reject)
export async function POST(req) {
  try {
    const adminCheck = await verifyAdminRequest();
    if (!adminCheck.admin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error || "Forbidden" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await req.json();
    const { projectId, status } = body;

    if (!projectId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: projectId, status" },
        { status: 400 }
      );
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const project = await MarketProject.findById(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.moderationStatus !== "pending") {
      return NextResponse.json(
        { success: false, error: "Moderation actions are restricted to pending projects only" },
        { status: 400 }
      );
    }

    // Update status
    project.moderationStatus = status;
    await project.save();

    console.log(`[Admin Moderation] Project "${project.projectName}" (${project._id}) updated to status: ${status}`);

    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/admin/project-moderation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}

