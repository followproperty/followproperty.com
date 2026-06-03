/**
 * Centralized list of emails authorized for admin role promotion.
 * Add new administrator emails to this array.
 * 
 * NOTE: MongoDB is the long-term source of truth for admin roles.
 * This list is used to bootstrap/promote users to the "admin" role 
 * upon registration or login verification.
 */
export const ADMIN_ALLOWED_EMAILS = [
  "demosingh1st@gmail.com"
];

/**
 * Checks if a given email is listed in the ADMIN_ALLOWED_EMAILS.
 * Performs a case-insensitive check.
 * 
 * @param {string} email - The email to check
 * @returns {boolean} True if the email is an authorized admin email
 */
export function isAdminEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_ALLOWED_EMAILS.some(
    (adminEmail) => adminEmail.trim().toLowerCase() === normalizedEmail
  );
}
