import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Lead from "@/models/Lead";
import { verifyAuthRequest } from "@/lib/auth-guards";

export async function POST(req) {
  try {
    await connectToDatabase();
    
    // Parse request body
    const body = await req.json();
    let { name, email, phone, projectId, projectName, source, city, requirements } = body;
    
    // Check if the user is authenticated to link their userId and auto-fill details
    let userId = null;
    try {
      const authResult = await verifyAuthRequest();
      if (authResult.authenticated && authResult.user) {
        userId = authResult.user._id;
        
        // Auto-fill from user profile if not explicitly supplied
        if (!name) {
          name = `${authResult.user.firstName || ""} ${authResult.user.lastName || ""}`.trim() || authResult.user.email;
        }
        if (!email) {
          email = authResult.user.email;
        }
        if (!phone) {
          phone = authResult.user.phoneNumber || "N/A";
        }
        if (!city) {
          city = authResult.user.city || "";
        }
      }
    } catch (err) {
      console.log("[Leads API] Guest session detected, proceeding without User reference:", err.message);
    }
    
    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, phone" },
        { status: 400 }
      );
    }

    // Check for duplicate lead to avoid double registration for the same action
    const duplicateQuery = {
      projectId: projectId || null,
      source: source || "landing"
    };

    if (userId) {
      duplicateQuery.$or = [
        { userId },
        { phone }
      ];
    } else {
      duplicateQuery.phone = phone;
    }

    const existingLead = await Lead.findOne(duplicateQuery);
    if (existingLead) {
      return NextResponse.json(
        { success: true, data: existingLead, message: "Lead already registered." },
        { status: 200 }
      );
    }
    
    // Create lead entry
    const lead = await Lead.create({
      name,
      email,
      phone,
      projectId: projectId || null,
      projectName: projectName || "",
      source: source || "landing",
      userId,
      city: city || "",
      requirements: requirements || ""
    });
    
    return NextResponse.json(
      { success: true, data: lead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/leads:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
