import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in User collection
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return NextResponse.json({
        success: true,
        message: "You are already on our list! We will keep you updated.",
        alreadyExists: true
      });
    }

    // Create a waitlist user placeholder in User collection
    user = await User.create({
      firebaseUid: `waitlist_${normalizedEmail}`,
      email: normalizedEmail,
      firstName: "",
      lastName: "",
      phoneNumber: "",
      city: "",
      state: "",
      role: "user",
      isOnboarded: false,
      onboardingCompleted: false
    });

    console.log(`[Waitlist Route] Registered new waitlist user: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: "Thanks for your interest! We will let you know when we launch."
    }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/auth/waitlist:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
