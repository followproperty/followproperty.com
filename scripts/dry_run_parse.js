import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import MarketProject from "../models/MarketProject.js";

// --- Parsers Implementation ---

function parseLocality(location, city) {
  if (!location) return "";
  let parts = location.split(",").map(p => p.trim());
  let candidate = parts[0] || "";
  
  // If first part is just the city name or empty, try the second part
  if (city && candidate.toLowerCase() === city.toLowerCase() && parts[1]) {
    candidate = parts[1];
  }
  
  // Remove city name from the candidate if it ends with it
  if (city) {
    const cityRegex = new RegExp(`\\s*,?\\s*${city}\\s*$`, "i");
    candidate = candidate.replace(cityRegex, "").trim();
  }
  return candidate;
}

function parseBhk(configuration) {
  if (!configuration) return [];
  const normalized = configuration.toLowerCase();
  const bhks = new Set();
  
  // Match standard numbers 1-9
  const matches = normalized.match(/\b([1-9])\b/g);
  if (matches) {
    matches.forEach(m => bhks.add(parseInt(m, 10)));
  }
  
  // Handle Studio as 1 BHK
  if (normalized.includes("studio") && bhks.size === 0) {
    bhks.add(1);
  }
  
  return Array.from(bhks).sort((a, b) => a - b);
}

function parseArea(superArea, avgAreaSqft) {
  const areaStr = (superArea || avgAreaSqft || "").replace(/,/g, "").trim();
  if (!areaStr) return { minArea: null, maxArea: null };
  
  // Match ranges like "1,960 - 3,250" or "1960 to 3250"
  const rangeMatch = areaStr.match(/(\d+)\s*(?:-|to)\s*(\d+)/i);
  if (rangeMatch) {
    const v1 = parseInt(rangeMatch[1], 10);
    const v2 = parseInt(rangeMatch[2], 10);
    return {
      minArea: Math.min(v1, v2),
      maxArea: Math.max(v1, v2)
    };
  }
  
  // Match single numbers
  const singleMatch = areaStr.match(/(\d+)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1], 10);
    return {
      minArea: val,
      maxArea: val
    };
  }
  
  return { minArea: null, maxArea: null };
}

function parseRatePerSqft(marketPrice, perSqftRate, launchingPrice) {
  // Try marketPrice first
  let rateStr = (marketPrice || "").replace(/[₹,]/g, "").trim();
  if (rateStr) {
    const rangeMatch = rateStr.match(/(\d+)\s*(?:-|to)\s*(\d+)/i);
    if (rangeMatch) {
      return {
        minRate: parseInt(rangeMatch[1], 10),
        maxRate: parseInt(rangeMatch[2], 10)
      };
    }
    const singleMatch = rateStr.match(/(\d+)/);
    if (singleMatch) {
      const val = parseInt(singleMatch[1], 10);
      return { minRate: val, maxRate: val };
    }
  }
  
  // Try perSqftRate
  rateStr = (perSqftRate || "").replace(/[₹,]/g, "").trim();
  if (rateStr) {
    const singleMatch = rateStr.match(/(\d+)/);
    if (singleMatch) {
      const val = parseInt(singleMatch[1], 10);
      return { minRate: val, maxRate: val };
    }
  }

  // Try launchingPrice
  rateStr = (launchingPrice || "").replace(/[~₹,]/g, "").trim();
  if (rateStr) {
    const rangeMatch = rateStr.match(/(\d+)\s*(?:-|to)\s*(\d+)/i);
    if (rangeMatch) {
      return {
        minRate: parseInt(rangeMatch[1], 10),
        maxRate: parseInt(rangeMatch[2], 10)
      };
    }
    const singleMatch = rateStr.match(/(\d+)/);
    if (singleMatch) {
      const val = parseInt(singleMatch[1], 10);
      return { minRate: val, maxRate: val };
    }
  }
  
  return { minRate: null, maxRate: null };
}

function parsePossessionYear(possessionDate, status) {
  const normStatus = (status || "").toLowerCase();
  if (normStatus.includes("ready") || normStatus.includes("ready to move")) {
    return 0; // 0 represents "Ready to Move"
  }
  
  if (possessionDate) {
    const match = possessionDate.match(/\b(19[89]\d|20[0-5]\d)\b/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year < 2024) return 0; // Past years are essentially Ready to Move now
      return year;
    }
  }
  
  return null;
}

// --- Main Execution Script ---

async function run() {
  console.log("Loading MongoDB URI...");
  const envContent = fs.readFileSync(path.resolve("e:/goan/site/.env"), "utf8");
  const uriMatch = envContent.match(/MONGODB_URI\s*=\s*(.*)/);
  if (!uriMatch) {
    throw new Error("MONGODB_URI not found in .env");
  }
  const MONGODB_URI = uriMatch[1].trim().replace(/['"]/g, "");

  console.log("Connecting to database...");
  await mongoose.connect(MONGODB_URI);
  
  console.log("Fetching 20 representative sample projects...");
  // Let's query a mix of Ready to Move, Under Construction, Gurgaon, Noida, etc.
  const projects = await MarketProject.find({}).limit(20);
  
  console.log(`Fetched ${projects.length} sample projects. Running parsing analysis...\n`);
  
  const parsedRecords = [];
  const metrics = {
    locality: { success: 0, total: 0 },
    bhk: { success: 0, total: 0 },
    area: { success: 0, total: 0 },
    price: { success: 0, total: 0 },
    possession: { success: 0, total: 0 }
  };
  
  const edgeCases = [];

  for (const doc of projects) {
    const location = doc.location || "";
    const city = doc.city || "";
    const config = doc.configuration || "";
    const superArea = doc.superArea || "";
    const avgArea = doc.avgAreaSqft || "";
    const marketPrice = doc.marketPrice || "";
    const perSqftRate = doc.perSqftRate || "";
    const launchingPrice = doc.launchingPrice || "";
    const possessionDate = doc.possessionDate || "";
    const status = doc.status || "";
    
    // Parse Locality
    const locality = parseLocality(location, city);
    metrics.locality.total++;
    if (locality) metrics.locality.success++;
    else edgeCases.push(`[Locality Empty] Name: "${doc.projectName}", Location: "${location}"`);

    // Parse BHK
    const bhk = parseBhk(config);
    metrics.bhk.total++;
    if (bhk && bhk.length > 0) metrics.bhk.success++;
    else edgeCases.push(`[BHK Empty] Name: "${doc.projectName}", Config: "${config}"`);

    // Parse Area
    const { minArea, maxArea } = parseArea(superArea, avgArea);
    metrics.area.total++;
    if (minArea !== null) metrics.area.success++;
    else edgeCases.push(`[Area Empty] Name: "${doc.projectName}", SuperArea: "${superArea}", AvgArea: "${avgArea}"`);

    // Parse Price
    const { minRate, maxRate } = parseRatePerSqft(marketPrice, perSqftRate, launchingPrice);
    let minPrice = null;
    let maxPrice = null;
    
    if (minRate !== null && minArea !== null) {
      minPrice = minRate * minArea;
    }
    if (maxRate !== null && maxArea !== null) {
      maxPrice = maxRate * maxArea;
    }
    
    metrics.price.total++;
    if (minPrice !== null) metrics.price.success++;
    else edgeCases.push(`[Price Empty] Name: "${doc.projectName}", MarketPrice: "${marketPrice}", PerSqftRate: "${perSqftRate}", MinRate: ${minRate}, MinArea: ${minArea}`);

    // Parse Possession Year
    const possessionYear = parsePossessionYear(possessionDate, status);
    metrics.possession.total++;
    if (possessionYear !== null) metrics.possession.success++;
    else edgeCases.push(`[Possession Empty] Name: "${doc.projectName}", Date: "${possessionDate}", Status: "${status}"`);

    parsedRecords.push({
      projectName: doc.projectName,
      city: doc.city,
      original: {
        location,
        configuration: config,
        superArea,
        avgAreaSqft: avgArea,
        marketPrice,
        perSqftRate,
        launchingPrice,
        possessionDate,
        status
      },
      parsed: {
        locality,
        bhk,
        minArea,
        maxArea,
        minPrice,
        maxPrice,
        possessionYear
      }
    });
  }

  // --- Print Final Report as JSON String for Shell Output Reading ---
  
  const report = {
    representativeSamples: parsedRecords,
    accuracyMetrics: {
      localityRate: `${((metrics.locality.success / metrics.locality.total) * 100).toFixed(0)}% (${metrics.locality.success}/${metrics.locality.total})`,
      bhkRate: `${((metrics.bhk.success / metrics.bhk.total) * 100).toFixed(0)}% (${metrics.bhk.success}/${metrics.bhk.total})`,
      areaRate: `${((metrics.area.success / metrics.area.total) * 100).toFixed(0)}% (${metrics.area.success}/${metrics.area.total})`,
      priceRate: `${((metrics.price.success / metrics.price.total) * 100).toFixed(0)}% (${metrics.price.success}/${metrics.price.total})`,
      possessionRate: `${((metrics.possession.success / metrics.possession.total) * 100).toFixed(0)}% (${metrics.possession.success}/${metrics.possession.total})`
    },
    edgeCasesDetected: edgeCases.slice(0, 15) // Top 15 edge cases
  };

  console.log("=== PARSING REPORT START ===");
  console.log(JSON.stringify(report, null, 2));
  console.log("=== PARSING REPORT END ===");

  process.exit(0);
}

run().catch(err => {
  console.error("Dry run parsing failed:", err);
  process.exit(1);
});
