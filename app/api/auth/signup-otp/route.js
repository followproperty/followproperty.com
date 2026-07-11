import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Helper to generate a unique Request ID locally
function generateRequestId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { firebaseUid, phone } = body;

    if (!firebaseUid || !phone) {
      return NextResponse.json(
        { success: false, error: "firebaseUid and phone are required" },
        { status: 400 }
      );
    }

    // Generate Request ID and Expiration locally
    const requestId = generateRequestId();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Create the user placeholder record with the verification request details
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.create({
        firebaseUid,
        email: `${phone.replace(/\+/g, '')}@phone.com`, // mock email formatted for Firebase
        phoneNumber: phone,
        role: "user",
        isOnboarded: false,
        onboardingCompleted: false,
        isPhoneVerified: false,
        requestId: requestId,
        otpExpiresAt: expiresAt
      });
      console.log(`[Signup OTP] Created user ${phone} with generated Request ID: ${requestId}`);
    } else {
      // If user somehow exists, update their request ID and expiry
      user.requestId = requestId;
      user.otpExpiresAt = expiresAt;
      user.isPhoneVerified = false;
      await user.save();
      console.log(`[Signup OTP] Updated existing user ${phone} with new Request ID: ${requestId}`);
    }

    return NextResponse.json({ success: true, data: { user, requestId } }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/auth/signup-otp:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
