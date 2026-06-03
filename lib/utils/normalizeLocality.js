/**
 * Normalizes locality/sector strings by converting them to lowercase
 * and removing spaces, hyphens, and non-alphanumeric punctuation.
 *
 * Examples:
 * "Sector 25"   -> "sector25"
 * "Sector-25"  -> "sector25"
 * "sector 25"   -> "sector25"
 * "DLF Phase-3" -> "dlfphase3"
 *
 * @param {string} str The input locality string
 * @returns {string} The normalized, comparable alphanumeric string
 */
export function normalizeLocality(str) {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "");
}
