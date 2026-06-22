import { NextResponse } from "next/server";
import { verifyAuthRequest } from "@/lib/auth-guards";
import connectToDatabase from "@/lib/db";
import Notification from "@/models/Notification";
// Import models to register their schemas for population
import MarketProject from "@/models/MarketProject";
import UpcomingProject from "@/models/UpcomingProject";
import Watchlist from "@/models/Watchlist";

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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "projectId",
        select: "projectName builderName builderSlug projectSlug city locality configuration minPrice maxPrice",
      })
      .populate({
        path: "watchlistId",
        select: "mainCategory specificType budget locality city",
      })
      .lean();

    return NextResponse.json({ success: true, data: notifications }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
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

    const body = await request.json();
    const { id, all = false } = body;

    if (all) {
      // Mark all as read
      await Notification.updateMany(
        { userId: user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return NextResponse.json({ success: true, message: "All notifications marked as read" }, { status: 200 });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required unless 'all' is true" },
        { status: 400 }
      );
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: notification }, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
