import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { isAdminEmail } from "@/config/admin/admin-emails";

/**
 * Server-side helper to verify if the incoming request is made by an authenticated administrator.
 * Can be used in both Server Components (Layouts/Pages) and API Routes.
 * 
 * MongoDB role is the long-term source of truth.
 * This helper also triggers lazy bootstrapping/promotion if an allowed admin logs in 
 * but does not have the "admin" role in the database yet.
 * 
 * @returns {Promise<{ authenticated: boolean, admin: boolean, user?: object, error?: string }>}
 */
export async function verifyAdminRequest() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { authenticated: false, admin: false, error: "Unauthorized: No token provided" };
    }

    // 1. Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken) {
      return { authenticated: false, admin: false, error: "Unauthorized: Invalid token" };
    }

    const { uid, email } = decodedToken;

    // 2. Establish connection to MongoDB
    await connectToDatabase();

    // 3. Retrieve user from database
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      return { authenticated: false, admin: false, error: "Unauthorized: User not found in database" };
    }

    // 4. Boostrap/Promote if matching allowed admin emails
    if (email && isAdminEmail(email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
      console.log(`[Admin Guard] Boostrapped/Promoted user ${email} to admin role.`);
    }

    // 5. Enforce role check against MongoDB (the long-term source of truth)
    if (user.role !== "admin") {
      return { authenticated: true, admin: false, user, error: "Forbidden: Admin access required" };
    }

    return { authenticated: true, admin: true, user };
  } catch (error) {
    console.error("Error verifying admin request:", error);
    return { authenticated: false, admin: false, error: error.message || "Unauthorized" };
  }
}

/**
 * Strict server-side route guard for Next.js Server Components.
 * Throws redirect to `/login` if unauthenticated, or to `/dashboard` if authenticated but not an admin.
 * 
 * @returns {Promise<object>} The MongoDB User document for the authenticated administrator.
 */
export async function requireAdmin() {
  const result = await verifyAdminRequest();

  if (!result.authenticated) {
    redirect("/login?redirect=/admin");
  }

  if (!result.admin) {
    redirect("/dashboard");
  }

  return result.user;
}
