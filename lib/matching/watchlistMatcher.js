import MarketProject from "@/models/MarketProject";
import { normalizeLocality } from "@/lib/utils/normalizeLocality";

// ─── Centralized Category Mapping ─────────────────────────────────────────────
export const CATEGORY_MAP = {
  residential: "Residential",
  built: "Residential",
  commercial: "Commercial",
  plots: "Plot",
  farmland: "Farmhouse",
  industrial: "Industrial",
};

/**
 * Translates a Watchlist category ID into the database project propertyType string.
 */
export function mapCategoryToPropertyType(category) {
  if (!category) return "";
  return CATEGORY_MAP[category.toLowerCase()] || "";
}

/**
 * Helper to extract a numeric BHK value from a string (e.g., "3 BHK" -> 3)
 */
function extractBhkNumber(typeStr) {
  if (!typeStr) return null;
  const match = typeStr.match(/(\d+)\s*BHK/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Core Matching Engine V1
 * Evaluates MarketProjects against Watchlist parameters.
 *
 * @param {Object} watchlist The user's Watchlist document from MongoDB
 * @param {Object} options Configuration overrides
 * @returns {Array} List of matched project documents with dynamic scores
 */
export async function matchWatchlist(watchlist, options = {}) {
  if (!watchlist) return [];

  // 1. Centralized Config & Override Settings
  const budgetFlexibility = options.budgetFlexibility !== undefined ? options.budgetFlexibility : 0.1; // default +-10%
  const weights = {
    locality: 30,
    specificType: 30,
    preferredBuilder: 20,
    possessionYear: 20,
    ...(options.weights || {}),
  };

  const userBudget = Number(watchlist.budget);
  const targetCity = watchlist.city;
  const mappedPropertyType = mapCategoryToPropertyType(watchlist.mainCategory);

  if (!targetCity || !mappedPropertyType || isNaN(userBudget)) {
    return [];
  }

  // 2. Compute Hard Filter Tolerances
  const minBudgetAllowed = userBudget * (1 - budgetFlexibility);
  const maxBudgetAllowed = userBudget * (1 + budgetFlexibility);

  // 3. Build Hard Filter Database Query
  const query = {
    city: { $regex: new RegExp(`^${targetCity.trim()}$`, "i") },
    propertyType: { $regex: new RegExp(`^${mappedPropertyType.trim()}$`, "i") },
    minPrice: { $lte: maxBudgetAllowed },
    maxPrice: { $gte: minBudgetAllowed },
  };

  // Fetch only matching projects from DB
  const projects = await MarketProject.find(query).lean();

  // 4. Soft Scoring & Ranking
  const scoredProjects = projects.map((project) => {
    let score = 0;
    const matchBreakdown = {
      locality: 0,
      specificType: 0,
      preferredBuilder: 0,
      possessionYear: 0,
    };

    // A. Locality Soft Match (Max weight: locality)
    if (watchlist.locality && project.locality) {
      const wlLoc = normalizeLocality(watchlist.locality);
      const pLoc = normalizeLocality(project.locality);

      if (wlLoc === pLoc) {
        matchBreakdown.locality = weights.locality;
      } else if (pLoc.includes(wlLoc) || wlLoc.includes(pLoc)) {
        matchBreakdown.locality = Math.round(weights.locality * 0.5);
      }
      score += matchBreakdown.locality;
    }

    // B. BHK / Specific Type Soft Match (Max weight: specificType)
    if (watchlist.specificType) {
      const wlType = watchlist.specificType.trim();
      const targetBhk = extractBhkNumber(wlType);

      if (targetBhk !== null && Array.isArray(project.bhk) && project.bhk.includes(targetBhk)) {
        // Direct numeric BHK match
        matchBreakdown.specificType = weights.specificType;
      } else {
        // Configuration Fallback Matching
        const pConfig = (project.configuration || "").trim().toLowerCase();
        const pType = (project.propertyType || "").trim().toLowerCase();
        const wlTypeLower = wlType.toLowerCase();

        if (pConfig.includes(wlTypeLower) || wlTypeLower.includes(pConfig)) {
          matchBreakdown.specificType = weights.specificType;
        } else if (pType.includes(wlTypeLower) || wlTypeLower.includes(pType)) {
          matchBreakdown.specificType = Math.round(weights.specificType * 0.5);
        }
      }
      score += matchBreakdown.specificType;
    }

    // C. Preferred Builder Soft Match (Max weight: preferredBuilder)
    if (watchlist.preferredBuilder && project.builderName) {
      const wlBuilder = watchlist.preferredBuilder.trim().toLowerCase();
      const pBuilder = project.builderName.trim().toLowerCase();

      if (pBuilder.includes(wlBuilder) || wlBuilder.includes(pBuilder)) {
        matchBreakdown.preferredBuilder = weights.preferredBuilder;
        score += matchBreakdown.preferredBuilder;
      }
    }

    // D. Possession Year Soft Match (Max weight: possessionYear)
    if (watchlist.possessionYear !== undefined && watchlist.possessionYear !== null && project.possessionYear !== undefined) {
      const wlPossessionStr = String(watchlist.possessionYear).trim().toLowerCase();
      const wlPossessionYear = wlPossessionStr.includes("ready") ? 0 : parseInt(wlPossessionStr, 10);
      const pPossessionYear = Number(project.possessionYear);

      if (!isNaN(wlPossessionYear) && !isNaN(pPossessionYear) && wlPossessionYear === pPossessionYear) {
        matchBreakdown.possessionYear = weights.possessionYear;
        score += matchBreakdown.possessionYear;
      }
    }

    // Map DB schema variables cleanly to properties display standard
    return {
      id: project._id.toString(),
      _id: project._id.toString(),
      builderSlug: project.builderSlug || "",
      projectSlug: project.projectSlug || "",
      title: project.projectName,
      projectName: project.projectName,
      status: project.status || (project.possessionYear === 0 ? "Ready to Move" : "Under Construction"),
      specificType: project.configuration || (project.bhk && project.bhk.length > 0 ? `${project.bhk[0]} BHK` : project.propertyType),
      locality: project.locality || project.location,
      city: project.city,
      builder: project.builderName,
      possessionYear: project.possessionYear === 0 ? "Ready to Move" : project.possessionYear,
      superArea: project.superArea ? Number(project.superArea) : (project.avgAreaSqft ? Number(project.avgAreaSqft) : 0),
      price: project.minPrice || 0,
      minPrice: project.minPrice || 0,
      maxPrice: project.maxPrice || 0,
      matchScore: score,
      matchBreakdown,
    };
  });

  // 5. Rank by Highest Score First
  return scoredProjects.sort((a, b) => b.matchScore - a.matchScore);
}
