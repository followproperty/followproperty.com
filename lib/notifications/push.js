import admin from "@/lib/firebase-admin";
import User from "@/models/User";

/**
 * Sends a browser push notification via FCM to all tokens registered for a user.
 * Automatically cleans up any expired/invalid registration tokens returned by FCM.
 * 
 * @param {string} userId - Mongoose User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification body text
 * @param {object} data - Optional custom key-value data payload
 */
export async function sendPushToUser(userId, title, message, data = {}) {
  try {
    const user = await User.findById(userId).select("fcmTokens email").lean();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      // Return gracefully since the user simply hasn't enabled/registered push alerts
      return { success: true, message: "No FCM tokens registered for user" };
    }

    const linkUrl = data.projectId 
      ? `/projects/${data.projectId}` 
      : "/notifications";

    const payload = {
      tokens: user.fcmTokens,
      notification: {
        title,
        body: message,
      },
      data: {
        click_action: linkUrl,
        ...data,
      },
      webpush: {
        notification: {
          icon: "/favicon.svg",
          badge: "/favicon.svg",
        },
        fcmOptions: {
          link: linkUrl,
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(payload);
    
    // Collect index list of tokens that have expired or are unregistered
    const tokensToRemove = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        if (
          error &&
          (error.code === "messaging/registration-token-not-registered" ||
           error.code === "messaging/invalid-argument" ||
           error.message?.includes("not registered"))
        ) {
          tokensToRemove.push(user.fcmTokens[idx]);
        }
      }
    });

    // Bulk remove expired tokens from user profile
    if (tokensToRemove.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { $in: tokensToRemove } }
      });
      console.log(`[Push Notification] Cleaned up ${tokensToRemove.length} inactive tokens for user ${user.email}`);
    }

    console.log(`[Push Notification] Sent matching push to user ${user.email} (Success: ${response.successCount}, Failure: ${response.failureCount})`);
    return { success: true, response };
  } catch (error) {
    console.error("[Push Notification] Failed to send push notification:", error);
    return { success: false, error: error.message };
  }
}
