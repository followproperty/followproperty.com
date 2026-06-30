import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import MarketProject from "@/models/MarketProject";

export async function GET(req) {
  try {
    // Authenticate request using FIELD_COLLECTOR_API_KEY
    const apiKey = req.headers.get("authorization")?.split("Bearer ")[1];
    const expectedApiKey = process.env.FIELD_COLLECTOR_API_KEY || "fp_fc_8f9c1d2e3b4a5f6c7a8d9e0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0";
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // 1. Total projects in marketprojects
    const total = await MarketProject.countDocuments({});

    // 2. Completed projects count (gps is set and images has at least 4 photos)
    const completed = await MarketProject.countDocuments({
      gps: { $exists: true, $ne: "" },
      "images.3": { $exists: true } // index 3 exists means images has length >= 4
    });

    // 3. Completed today count
    // Calculate start of today in IST (UTC +5:30)
    const now = new Date();
    // Offset now to get IST date
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (3600000 * 5.5));
    
    const startOfTodayIST = new Date(
      istTime.getFullYear(),
      istTime.getMonth(),
      istTime.getDate()
    );
    // Convert back to UTC representation for database query comparisons
    const startOfTodayUTC = new Date(startOfTodayIST.getTime() - (3600000 * 5.5));

    const completedToday = await MarketProject.countDocuments({
      gps: { $exists: true, $ne: "" },
      "images.3": { $exists: true },
      updatedAt: { $gte: startOfTodayUTC }
    });

    return NextResponse.json({
      success: true,
      stats: {
        total,
        completed,
        remaining: Math.max(0, total - completed),
        completedToday,
      }
    });
  } catch (err) {
    console.error("Error in field-collector/stats API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load stats." },
      { status: 500 }
    );
  }
}
