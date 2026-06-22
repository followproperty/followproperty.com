import { NextResponse } from "next/server";
import { verifyAuthRequest } from "@/lib/auth-guards";
import connectToDatabase from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET(request) {
  try {
    const authResult = await verifyAuthRequest({ checkRevoked: true });
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    await connectToDatabase();

    const count = await Notification.countDocuments({ userId: user._id, isRead: false });

    return NextResponse.json({ success: true, data: { count } }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/notifications/unread-count:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
