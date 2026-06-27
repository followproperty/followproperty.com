import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { verifyAdminRequest } from "@/lib/admin/admin-guards";
import UpcomingProject from "@/models/UpcomingProject";
import Builder from "@/models/Builder";
import { 
  normalizeTitleCase, 
  normalizeBuilder, 
  normalizeLocality, 
  normalizeCity,
  formatConfiguration,
  formatMarketPriceRange,
  formatAreaRange,
  generateBuilderSlug
} from "@/utils/admin/normalization";

/**
 * GET /api/admin/upcoming-projects
 * 
 * Secure retrieval endpoint for autocomplete search in Selected State + City.
 */
export async function GET(req) {
  try {
    const authResult = await verifyAdminRequest();
    if (!authResult.admin) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const query = searchParams.get("query") || "";

    if (!state || !city) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: state and city" },
        { status: 400 }
      );
    }

    const searchQuery = {
      state: { $regex: new RegExp(`^${state}$`, "i") },
      city: { $regex: new RegExp(`^${city}$`, "i") }
    };

    if (query.trim()) {
      searchQuery.$or = [
        { projectName: { $regex: new RegExp(query.trim(), "i") } },
        { builderName: { $regex: new RegExp(query.trim(), "i") } }
      ];
    }

    const projects = await UpcomingProject.find(searchQuery)
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, data: projects }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/upcoming-projects:", error);
    return NextResponse.json(
      { success: false, error: "Server error occurred while searching projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/upcoming-projects
 * 
 * Secure Ingestion endpoint for admins to add upcoming projects.
 * Enforces strict validation, robust normalization, duplicate check, and logs audit headers.
 */
export async function POST(req) {
  try {
    // 1. Verify administrative access
    const authResult = await verifyAdminRequest();
    if (!authResult.admin) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const adminUser = authResult.user;

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

    // 6. Duplicate Prevention Check
    const existing = await UpcomingProject.findOne({ projectName, builderName, city });
    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: `A project named "${projectName}" by "${builderName}" already exists in "${city}". Duplicate entries are prohibited.` 
        },
        { status: 409 }
      );
    }

    // Ensure builder exists in Builder collection
    if (builderName) {
      const bSlug = generateBuilderSlug(builderName);
      if (bSlug) {
        const existingBuilder = await Builder.findOne({
          $or: [{ name: builderName }, { slug: bSlug }]
        });
        if (!existingBuilder) {
          await Builder.create({
            name: builderName,
            slug: bSlug,
            status: "active"
          });
        }
      }
    }

    // 7. Write record into UpcomingProjects with Audit tracing
    const newProject = await UpcomingProject.create({
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
      projectSource: "upcoming",
      createdBy: adminUser._id,
      createdByEmail: adminUser.email,
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
    });

    console.log(`[UpcomingProject Ingestion] Successfully created document ${newProject._id} by ${adminUser.email}`);

    // 8. Return Verification Impact Report
    return NextResponse.json({
      success: true,
      message: "Upcoming project saved successfully!",
      collection: "upcomingprojects",
      documentId: newProject._id,
      normalizedValues: {
        projectName: newProject.projectName,
        builderName: newProject.builderName,
        propertyType: newProject.propertyType,
        status: newProject.status,
        city: newProject.city,
        state: newProject.state,
        locality: newProject.locality,
        location: newProject.location,
        bhk: newProject.bhk,
        configuration: newProject.configuration,
        minPrice: newProject.minPrice,
        maxPrice: newProject.maxPrice,
        marketPrice: newProject.marketPrice,
        minArea: newProject.minArea,
        maxArea: newProject.maxArea,
        superArea: newProject.superArea,
        possessionYear: newProject.possessionYear,
        projectSource: newProject.projectSource,
        createdByEmail: newProject.createdByEmail,
        // Optional extra fields
        launchedDate: newProject.launchedDate,
        launchingPrice: newProject.launchingPrice,
        possessionDate: newProject.possessionDate,
        units: newProject.units,
        totalArea: newProject.totalArea,
        towers: newProject.towers,
        apartmentsPerFloor: newProject.apartmentsPerFloor,
        perSqftRate: newProject.perSqftRate,
        perSqftRentalAvg: newProject.perSqftRentalAvg,
        monthlyRentRange: newProject.monthlyRentRange,
        avgAreaSqft: newProject.avgAreaSqft,
        gps: newProject.gps,
        unitSize: newProject.unitSize,
        projectPdf: newProject.projectPdf,
        images: newProject.images,
        videos: newProject.videos
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating upcoming project:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred while inserting upcoming project" },
      { status: 500 }
    );
  }
}
