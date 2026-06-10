import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/admin-guards";
import UpcomingProject from "@/models/UpcomingProject";
import { 
  normalizeTitleCase, 
  normalizeBuilder, 
  normalizeLocality, 
  normalizeCity,
  formatConfiguration,
  formatMarketPriceRange,
  formatAreaRange
} from "@/utils/admin/normalization";

/**
 * PUT /api/admin/upcoming-projects/[id]
 * 
 * Secure endpoint to update a single upcoming project document by MongoDB ObjectId.
 */
export async function PUT(req, { params }) {
  try {
    // 1. Verify administrative access
    const authResult = await verifyAdminRequest();
    if (!authResult.admin) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const unwrappedParams = await params;
    const id = unwrappedParams.id;

    // 2. Parse form body
    const body = await req.json();
    const {
      projectName: rawProjectName,
      builderName: rawBuilderName,
      propertyType,
      status,
      city: rawCity,
      locality: rawLocality,
      location: rawLocation,
      bhk: rawBhk,
      minPrice: rawMinPrice,
      maxPrice: rawMaxPrice,
      minArea: rawMinArea,
      maxArea: rawMaxArea,
      possessionYear: rawPossessionYear,
      // Optional extra fields
      launchedDate,
      launchingPrice,
      possessionDate,
      units,
      totalArea,
      towers,
      apartmentsPerFloor,
      perSqftRate,
      perSqftRentalAvg,
      monthlyRentRange,
      avgAreaSqft,
      gps,
      unitSize,
      projectPdf,
      images: rawImages,
      videos: rawVideos
    } = body;

    const images = Array.isArray(rawImages) ? rawImages : (typeof rawImages === "string" ? rawImages.split(",").map(s => s.trim()).filter(Boolean) : []);
    const videos = Array.isArray(rawVideos) ? rawVideos : (typeof rawVideos === "string" ? rawVideos.split(",").map(s => s.trim()).filter(Boolean) : []);

    // 3. Validation Checklist
    if (
      !rawProjectName || 
      !rawBuilderName || 
      !propertyType || 
      !status || 
      !rawCity || 
      !rawLocality || 
      !rawLocation || 
      !rawBhk || 
      rawMinPrice === undefined || 
      rawMaxPrice === undefined || 
      rawMinArea === undefined || 
      rawMaxArea === undefined || 
      rawPossessionYear === undefined
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields in submission" },
        { status: 400 }
      );
    }

    // Strict numerical types validations
    const minPrice = parseInt(rawMinPrice, 10);
    const maxPrice = parseInt(rawMaxPrice, 10);
    const minArea = parseInt(rawMinArea, 10);
    const maxArea = parseInt(rawMaxArea, 10);
    const possessionYear = parseInt(rawPossessionYear, 10);

    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice <= 0 || maxPrice <= 0) {
      return NextResponse.json({ success: false, error: "Prices must be positive numbers" }, { status: 400 });
    }
    if (maxPrice < minPrice) {
      return NextResponse.json({ success: false, error: "Maximum price cannot be less than minimum price" }, { status: 400 });
    }
    if (isNaN(minArea) || isNaN(maxArea) || minArea <= 0 || maxArea <= 0) {
      return NextResponse.json({ success: false, error: "Areas must be positive numbers in Sqft" }, { status: 400 });
    }
    if (maxArea < minArea) {
      return NextResponse.json({ success: false, error: "Maximum area cannot be less than minimum area" }, { status: 400 });
    }
    if (isNaN(possessionYear) || (possessionYear !== 0 && (possessionYear < 2024 || possessionYear > 2035))) {
      return NextResponse.json({ success: false, error: "Possession year must be 0 (Ready) or between 2024 and 2035" }, { status: 400 });
    }

    const parsedBhk = Array.isArray(rawBhk) ? rawBhk.map(Number).filter(n => !isNaN(n)) : [];
    if (parsedBhk.length === 0 && propertyType === "Residential") {
      return NextResponse.json({ success: false, error: "BHK configurations are required for Residential property types" }, { status: 400 });
    }

    // 4. Normalization Pipeline
    const projectName = normalizeTitleCase(rawProjectName);
    const builderName = normalizeBuilder(rawBuilderName);
    const { city, state } = normalizeCity(rawCity);
    const locality = normalizeLocality(rawLocality);
    
    // Auto-formatting display compatibility properties
    const configuration = propertyType === "Residential" ? formatConfiguration(parsedBhk) : "N/A";
    const marketPrice = formatMarketPriceRange(minPrice, maxPrice);
    const superArea = formatAreaRange(minArea, maxArea);
    
    // Build canonical full location address
    const location = rawLocation.trim().replace(/\s+/g, " ");

    // 5. Connect to MongoDB
    await connectToDatabase();

    // 6. Update document
    const updatedProject = await UpcomingProject.findByIdAndUpdate(
      id,
      {
        projectName,
        builderName,
        propertyType,
        status,
        city,
        state,
        locality,
        location,
        bhk: parsedBhk,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        possessionYear,
        configuration,
        marketPrice,
        superArea,
        // Optional extra fields
        launchedDate: launchedDate || "",
        launchingPrice: launchingPrice || "",
        possessionDate: possessionDate || "",
        units: units || "",
        totalArea: totalArea || "",
        towers: towers || "",
        apartmentsPerFloor: apartmentsPerFloor || "",
        perSqftRate: perSqftRate || "",
        perSqftRentalAvg: perSqftRentalAvg || "",
        monthlyRentRange: monthlyRentRange || "",
        avgAreaSqft: avgAreaSqft || "",
        gps: gps || "",
        unitSize: unitSize || "",
        projectPdf: projectPdf || "",
        images,
        videos
      },
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, error: "Project not found in database" },
        { status: 404 }
      );
    }

    console.log(`[UpcomingProject Update] Successfully updated document ${id}`);

    // 7. Return Verification Impact Report
    return NextResponse.json({
      success: true,
      message: "Upcoming project updated successfully!",
      collection: "upcomingprojects",
      documentId: id,
      normalizedValues: updatedProject
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating upcoming project:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred while updating project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/upcoming-projects/[id]
 * 
 * Secure endpoint to delete/archive a single upcoming project document by MongoDB ObjectId.
 */
export async function DELETE(req, { params }) {
  try {
    // 1. Verify administrative access
    const authResult = await verifyAdminRequest();
    if (!authResult.admin) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const unwrappedParams = await params;
    const id = unwrappedParams.id;

    // 2. Connect to MongoDB
    await connectToDatabase();

    // 3. Delete document
    const deletedProject = await UpcomingProject.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json(
        { success: false, error: "Project not found in database" },
        { status: 404 }
      );
    }

    console.log(`[UpcomingProject Deletion] Successfully deleted document ${id}`);

    return NextResponse.json({
      success: true,
      message: "Project successfully deleted!"
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting upcoming project:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred while deleting project" },
      { status: 500 }
    );
  }
}
