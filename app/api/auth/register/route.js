import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import BuilderApplication from "@/models/BuilderApplication";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/config/admin/admin-emails";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { firebaseUid, email, firstName, lastName, phoneNumber, city, state, isBuilder } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: firebaseUid and email" },
        { status: 400 }
      );
    }

    const isAllowedAdmin = isAdminEmail(email);

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        phoneNumber: phoneNumber || "",
        city: city || "",
        state: state || "",
        role: isAllowedAdmin ? "admin" : "user",
        isOnboarded: false,
        onboardingCompleted: false
      });
      console.log(`[Register Route] Created new user ${email} with role: ${user.role}`);

      if (isBuilder) {
        await BuilderApplication.findOneAndUpdate(
          { userId: user._id },
          { status: "draft" },
          { upsert: true }
        );
        console.log(`[Register Route] Created/verified BuilderApplication (status: draft) for user ${email}`);
      }
    } else {
      // Bootstrapping/Promotion: If email is in allowed list, promote them to "admin" if they aren't already.
      // Do not demote them if their email is not in the list (MongoDB role is long-term source of truth).
      if (isAllowedAdmin && user.role !== "admin") {
        user.role = "admin";
        await user.save();
        console.log(`[Register Route] Promoted existing user ${email} to admin.`);
      }
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/auth/register:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred during user registration" },
      { status: 500 }
    );
  }
}
