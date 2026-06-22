import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import Notification from "@/models/Notification";
import { matchWatchlist } from "@/lib/matching/watchlistMatcher";
import { sendPushToUser } from "@/lib/notifications/push";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Secure production route, allow open local testing
    if (process.env.NODE_ENV === "production" && secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid secret key" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // 1. Query all active user watchlist requirements
    const watchlists = await Watchlist.find({}).lean();
    let totalScanned = 0;
    let newNotificationCount = 0;

    console.log(`[Cron Match Sync] Starting sync for ${watchlists.length} watchlists...`);

    // 2. Loop through each watchlist requirement configuration
    for (const watchlist of watchlists) {
      totalScanned++;
      
      // Execute the existing matching engine logic
      const matches = await matchWatchlist(watchlist);
      
      // Filter for valid matches (match score >= 40)
      const validMatches = matches.filter(m => m.matchScore >= 40);

      for (const match of validMatches) {
        try {
          // Attempt to save notification in database
          // Mongoose unique compound index on { watchlistId: 1, projectId: 1 } prevents duplicates
          const newNotif = await Notification.create({
            userId: watchlist.userId,
            title: "New Property Match",
            message: `The project "${match.projectName}" matches your buying requirement in ${match.locality || match.city} with a score of ${match.matchScore}%!`,
            projectId: match._id,
            projectModel: "UpcomingProject",
            watchlistId: watchlist._id,
          });

          newNotificationCount++;

          // Trigger browser FCM push notification for the newly created match
          await sendPushToUser(
            watchlist.userId,
            newNotif.title,
            newNotif.message,
            {
              projectId: String(match._id),
              watchlistId: String(watchlist._id),
              matchScore: String(match.matchScore)
            }
          );
        } catch (err) {
          // Ignore MongoDB duplicate key error (code 11000) since it means user was already notified
          if (err.code === 11000 || err.message?.includes("E11000")) {
            continue;
          }
          console.error(`[Cron Match Sync] Error saving notification for watchlist ${watchlist._id} & project ${match._id}:`, err);
        }
      }
    }

    console.log(`[Cron Match Sync] Completed. Scanned: ${totalScanned}, New alerts created: ${newNotificationCount}`);

    return NextResponse.json({
      success: true,
      scannedCount: totalScanned,
      newNotifications: newNotificationCount
    }, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/cron/match-sync:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error occurred during matching sync" },
      { status: 500 }
    );
  }
}

// Support GET for easy curl/cron triggers if configured
export async function GET(request) {
  return POST(request);
}
