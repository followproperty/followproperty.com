import { NextResponse } from "next/server";
import { verifyAuthRequest } from "@/lib/auth-guards";
import connectToDatabase from "@/lib/db";
import Builder from "@/models/Builder";
import MarketProject from "@/models/MarketProject";

export async function GET() {
  try {
    const authResult = await verifyAuthRequest({ checkRevoked: true });
    if (!authResult.authenticated) {
      const response = NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
      response.cookies.set("token", "", { expires: new Date(0), path: "/" });
      response.cookies.set("user_role", "", { expires: new Date(0), path: "/" });
      response.cookies.set("builder_status", "", { expires: new Date(0), path: "/" });
      return response;
    }

    const { user, decodedToken } = authResult;
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();

    // 2. Enforce Builder Role check
    if (user.role !== "builder") {
      return NextResponse.json(
        { success: false, error: "Access Denied: Restricted to builder role" },
        { status: 403 }
      );
    }

    // 3. Validate builderId is linked
    if (!user.builderId) {
      return NextResponse.json(
        { success: false, error: "Profile Link Missing: No builder profile linked to user account" },
        { status: 403 }
      );
    }

    // 4. Fetch Builder profile document
    const builder = await Builder.findById(user.builderId).lean();
    if (!builder) {
      return NextResponse.json(
        { success: false, error: "Builder Profile Offline: Linked profile not found or deactivated" },
        { status: 404 }
      );
    }

    // 5. Fetch projects matching this builderId relationship
    const projects = await MarketProject.find({ builderId: builder._id }).lean();

    return NextResponse.json({
      success: true,
      builder: {
        id: builder._id.toString(),
        name: builder.name,
        slug: builder.slug,
        status: builder.status,
      },
      projects: projects.map((p) => ({
        id: p._id.toString(),
        builderSlug: p.builderSlug || "",
        projectSlug: p.projectSlug || "",
        projectName: p.projectName,
        city: p.city || "",
        locality: p.locality || "",
        propertyType: p.propertyType || "Residential",
        status: p.status || "Under Construction",
        minPrice: p.minPrice || 0,
        maxPrice: p.maxPrice || 0,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/builder-dashboard:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}

