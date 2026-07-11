import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

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

    let requestId = '';
    const otpBackendUrl = process.env.OTP_BACKEND_URL || process.env.NEXT_PUBLIC_OTP_BACKEND_URL || "http://localhost:3000";
    try {
      const otpResponse = await fetch(`${otpBackendUrl}/api/v1/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: phone,
          phone: phone,
          domain: "followproperty.com"
        }),
      });

      const otpData = await otpResponse.json();
      if (otpData.status === "success") {
        requestId = otpData.data.requestId;
      } else {
        throw new Error(otpData.message || "Failed to register with OTP server");
      }
    } catch (otpError) {
      console.error("[Signup OTP] Failed to register with local OTP backend:", otpError.message);
      return NextResponse.json(
        { success: false, error: "Failed to connect to the SMS verification gateway server." },
        { status: 500 }
      );
    }

    // Create the user placeholder record in the website database
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.create({
        firebaseUid,
        email: `${phone.replace(/\+/g, '')}@phone.com`, // mock email formatted for Firebase
        phoneNumber: phone,
        role: "user",
        isOnboarded: false,
        onboardingCompleted: false,
        isPhoneVerified: false // defaults to false until SMS is received
      });
      console.log(`[Signup OTP] Created pending phone user: ${phone}, requestId: ${requestId}`);
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
