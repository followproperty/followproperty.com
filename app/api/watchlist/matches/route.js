import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import connectToDatabase from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import { matchWatchlist } from "@/lib/matching/watchlistMatcher";

export async function GET(request) {
  try {
    await connectToDatabase();

    // 1. Get authenticated user from session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const watchlistId = searchParams.get("watchlistId");

    let watchlist = null;

    if (watchlistId) {
      // Find specific watchlist matching user
      watchlist = await Watchlist.findOne({ _id: watchlistId, firebaseUid });
      if (!watchlist) {
        return NextResponse.json(
          { success: false, error: "Specified watchlist requirement not found." },
          { status: 404 }
        );
      }
    } else {
      // Fallback to retrieving the user's latest requirement configuration
      watchlist = await Watchlist.findOne({ firebaseUid }).sort({ createdAt: -1 });
    }

    // 3. Return early if no watchlist requirements are set up yet
    if (!watchlist) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // 4. Run Watchlist Matching Engine V1
    const matches = await matchWatchlist(watchlist);

    return NextResponse.json({ success: true, data: matches }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/watchlist/matches:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred" },
      { status: 500 }
    );
  }
}
