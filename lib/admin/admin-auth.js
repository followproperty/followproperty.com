import { isAdminEmail } from "@/config/admin/admin-emails";
import User from "@/models/User";

/**
 * Bootstraps and promotes a user's role to "admin" if their email matches
 * the centralized ADMIN_ALLOWED_EMAILS. 
 * 
 * MongoDB role is the long-term source of truth.
 * Users are only promoted/bootstrapped. They are never demoted automatically
 * even if their email is not present in the allowed list, maintaining DB as source of truth.
 * 
 * @param {string} email - User's email
 * @param {string} firebaseUid - User's Firebase UID
 * @returns {Promise<string>} The user's role ("admin" or "user") after sync/verification
 */
export async function syncUserAdminRole(email, firebaseUid) {
  if (!email || !firebaseUid) {
    return "user";
  }

  const isAllowedAdmin = isAdminEmail(email);

  try {
    const user = await User.findOne({ firebaseUid });
    
    if (user) {
      // If user exists and email is allowed as admin, bootstrap/promote them to "admin"
      if (isAllowedAdmin && user.role !== "admin") {
        user.role = "admin";
        await user.save();
        console.log(`[Admin Bootstrapper] Promoted existing user ${email} to admin.`);
      }
      return user.role;
    }
  } catch (error) {
    console.error("Error in syncUserAdminRole database query:", error);
  }

  // If user doesn't exist yet, return what the initial role should be
  return isAllowedAdmin ? "admin" : "user";
}
