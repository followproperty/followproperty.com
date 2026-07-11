import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "requestId is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ requestId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Verification request not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    let status = user.isPhoneVerified ? 'verified' : 'pending';

    // Check for expiration
    if (status === 'pending' && user.otpExpiresAt && new Date(user.otpExpiresAt) < now) {
      status = 'expired';
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: user.isPhoneVerified,
        status: status
      }
    });
  } catch (error) {
    console.error("Error in GET /api/auth/status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
