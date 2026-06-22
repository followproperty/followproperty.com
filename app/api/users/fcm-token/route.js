import { NextResponse } from "next/server";
import { verifyAuthRequest } from "@/lib/auth-guards";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const authResult = await verifyAuthRequest({ checkRevoked: true });
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const body = await request.json();
    const { token, action = "register" } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    if (action === "register") {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { fcmTokens: token }
      });
      console.log(`[FCM API] Registered push token for user: ${user.email}`);
    } else if (action === "remove") {
      await User.findByIdAndUpdate(user._id, {
        $pull: { fcmTokens: token }
      });
      console.log(`[FCM API] Removed push token for user: ${user.email}`);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'register' or 'remove'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/users/fcm-token:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
