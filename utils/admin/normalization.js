import { CITY_TO_STATE } from "../../constants/admin/cities.js";

/**
 * Standardizes word casing to Title Case.
 */
export function normalizeTitleCase(str) {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, " ");
}

/**
 * Normalizes builder names, uppercase acronyms and title cases brands.
 */
export function normalizeBuilder(builder) {
  if (!builder) return "";
  const cleaned = builder.trim().replace(/\s+/g, " ");
  const upper = cleaned.toUpperCase();
  
  // Canonical Acronyms List
  const acronyms = ["DLF", "M3M", "BPTP", "CGHS", "HUDA", "TARC", "SCO", "SSD", "CGEWHO"];
  if (acronyms.includes(upper)) {
    return upper;
  }
  
  return normalizeTitleCase(cleaned);
}

/**
 * Normalizes sector and locality names into consistent canonical format (e.g. "Sector 82")
 */
export function normalizeLocality(locality) {
  if (!locality) return "";
  let cleaned = locality.trim().replace(/\s+/g, " ");
  
  // Match "sec 82", "sec-82", "sector-82", "sector 82" (case insensitive)
  const sectorRegex = /\bsec(?:tor)?[- ]*(\d+\w*)\b/i;
  const match = cleaned.match(sectorRegex);
  if (match) {
    const sectorNum = match[1].toUpperCase();
    return `Sector ${sectorNum}`;
  }
  
  return normalizeTitleCase(cleaned);
}

/**
 * Maps city names and aliases to canonical database names.
 */
const CITY_MAP = {
  gurugram: "Gurgaon",
  gurgaon: "Gurgaon",
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  bombay: "Mumbai",
  mumbai: "Mumbai",
  madras: "Chennai",
  chennai: "Chennai"
};

export function normalizeCity(cityInput) {
  if (!cityInput) return { city: "", state: "" };
  const key = cityInput.trim().toLowerCase();
  
  const canonicalCity = CITY_MAP[key] || normalizeTitleCase(cityInput);
  const state = CITY_TO_STATE[canonicalCity] || "";
  
  return { city: canonicalCity, state };
}

/**
 * Format numeric prices in Rupees into clean readable Crore/Lakh string strings.
 */
export function formatRupeeText(amount) {
  if (!amount || isNaN(amount)) return "";
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
  }
  return amount.toLocaleString("en-IN");
}

/**
 * Formats a min/max price range into a standard display string (e.g. "3.5 Cr - 7 Cr")
 */
export function formatMarketPriceRange(minPrice, maxPrice) {
  if (!minPrice || !maxPrice) return "";
  const minText = formatRupeeText(minPrice);
  const maxText = formatRupeeText(maxPrice);
  if (minText === maxText) return minText;
  return `${minText} - ${maxText}`;
}

/**
 * Formats a min/max area range into a standard display string (e.g. "1,800 - 2,800")
 */
export function formatAreaRange(minArea, maxArea) {
  if (!minArea || !maxArea) return "";
  const minText = minArea.toLocaleString("en-US");
  const maxText = maxArea.toLocaleString("en-US");
  if (minText === maxText) return minText;
  return `${minText} - ${maxText}`;
}

/**
 * Formats BHK values array into standard configuration string (e.g. "3, 4 BHK")
 */
export function formatConfiguration(bhkArray) {
  if (!bhkArray || bhkArray.length === 0) return "";
  return `${bhkArray.join(", ")} BHK`;
}

/**
 * Standard slug generator for builders.
 */
export function generateBuilderSlug(builderName) {
  if (!builderName) return "";
  return normalizeBuilder(builderName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Standard slug generator for projects.
 */
export function generateProjectSlug(projectName) {
  if (!projectName) return "";
  return projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

