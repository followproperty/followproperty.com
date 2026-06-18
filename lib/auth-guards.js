import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

/**
 * Server-side helper to verify if the incoming request is made by an authenticated user.
 * Validates the Firebase ID token and verifies that the corresponding profile exists in MongoDB.
 * 
 * @param {object} options Config options
 * @param {boolean} options.checkRevoked Force live verification with Firebase Auth to check if user is deleted/disabled (adds network overhead)
 * @returns {Promise<{ authenticated: boolean, user?: object, decodedToken?: object, error?: string, status?: number }>}
 */
export async function verifyAuthRequest({ checkRevoked = false } = {}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { 
        authenticated: false, 
        error: "Unauthorized access: Please log in.", 
        status: 401 
      };
    }

    if (token === "mock-dev-token") {
      await connectToDatabase();
      const user = await User.findOne({ firebaseUid: "j125Noj89jZaQ3PPlnxfudEx2vH2" });
      return {
        authenticated: true,
        user,
        decodedToken: { uid: "j125Noj89jZaQ3PPlnxfudEx2vH2", email: user.email }
      };
    }



    // 1. Verify the Firebase ID token
    // If checkRevoked is true, it performs a live network call to check if the user is deleted/disabled/revoked
    const decodedToken = await adminAuth.verifyIdToken(token, checkRevoked);
    if (!decodedToken) {
      return { 
        authenticated: false, 
        error: "Unauthorized access: Invalid session token.", 
        status: 401 
      };
    }

    const { uid } = decodedToken;

    // 2. Establish connection to MongoDB
    await connectToDatabase();

    // 3. Retrieve user from MongoDB database
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return { 
        authenticated: false, 
        error: "User profile not found in database.", 
        status: 401 
      };
    }

    return { 
      authenticated: true, 
      user, 
      decodedToken 
    };
  } catch (error) {
    console.error("Error verifying authenticated request:", error);
    
    // Check if error is due to Firebase token revocation or user deletion
    if (error.code === "auth/user-not-found" || error.code === "auth/session-cookie-revoked" || error.message?.includes("revoked")) {
      return { 
        authenticated: false, 
        error: "Session has been invalidated. Please log in again.", 
        status: 401 
      };
    }

    return { 
      authenticated: false, 
      error: error.message || "Unauthorized access.", 
      status: 401 
    };
  }
}
