import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";

export async function GET(req) {
  try {
    // Authenticate request using FIELD_COLLECTOR_API_KEY
    const apiKey = req.headers.get("authorization")?.split("Bearer ")[1];
    const expectedApiKey = process.env.FIELD_COLLECTOR_API_KEY || "fp_field_collector_secret_2026_x92";
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Fetch distinct localities
    const localities = await MarketProject.distinct("locality");
    
    // Clean and sort localities list
    const filtered = localities
      .filter((loc) => loc && typeof loc === "string" && loc.trim() !== "")
      .map((loc) => loc.trim())
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      success: true,
      localities: Array.from(new Set(filtered))
    });
  } catch (err) {
    console.error("Error in field-collector/localities API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load localities." },
      { status: 500 }
    );
  }
}
