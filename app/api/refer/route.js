import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Referral from "@/models/Referral";

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { referrerName, referrerPhone, referrals } = body;
    
    if (!referrerName || !referrerPhone || !referrals || !Array.isArray(referrals) || referrals.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: referrerName, referrerPhone, and referrals are required." },
        { status: 400 }
      );
    }

    // Basic format validation
    for (const r of referrals) {
      if (!r.name || !r.phone) {
        return NextResponse.json(
          { success: false, error: "Each referral contact must have both a name and a phone number." },
          { status: 400 }
        );
      }
    }
    
    // Create database entry
    const newReferral = await Referral.create({
      referrerName,
      referrerPhone,
      referrals,
      projectName: "BPTP Downtown",
      status: "pending"
    });
    
    return NextResponse.json(
      { success: true, data: newReferral },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/refer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
