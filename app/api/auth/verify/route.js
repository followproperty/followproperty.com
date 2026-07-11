import { adminAuth } from "@/lib/firebase-admin";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import BuilderApplication from "@/models/BuilderApplication";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/config/admin/admin-emails";

export async function POST(req) {
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token missing",
        },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    await connectToDatabase();

    const isAllowedAdmin = isAdminEmail(email);

    // Check or auto-create User document in MongoDB
    let user = await User.findOne({ firebaseUid });
    /*
    if (user && user.isPhoneVerified === false) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete your phone number verification first.",
        },
        { status: 403 }
      );
    }
    */

    if (!user) {
      const displayName = decodedToken.name || "";
      const nameParts = displayName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      user = await User.create({
        firebaseUid,
        email,
        firstName,
        lastName,
        phoneNumber: decodedToken.phone_number || "",
        city: "",
        state: "",
        role: isAllowedAdmin ? "admin" : "user",
        isOnboarded: false,
        onboardingCompleted: false
      });
      console.log(`[Verify Route] Registered new user ${email} with role: ${user.role}`);
    } else {
      // Bootstrapping/Promotion: If email is in allowed list, promote them to "admin" if they aren't already.
      // Do not demote them if their email is not in the list (MongoDB role is long-term source of truth).
      if (isAllowedAdmin && user.role !== "admin") {
        user.role = "admin";
        await user.save();
        console.log(`[Verify Route] Promoted existing user ${email} to admin.`);
      }
    }

    // Fetch BuilderApplication status for the verified user
    const appDoc = await BuilderApplication.findOne({ userId: user._id }).lean();
    const builderApplicationStatus = appDoc ? appDoc.status : null;

    const userObj = user.toObject ? user.toObject() : user;
    userObj.builderApplicationStatus = builderApplicationStatus;

    const response = NextResponse.json({
      success: true,
      user: userObj,
    });

    // Set secure HTTP-only cookie for route protection in middleware
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    response.cookies.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    response.cookies.set("builder_status", builderApplicationStatus || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in POST /api/auth/verify:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
}