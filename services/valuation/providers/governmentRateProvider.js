/**
 * Provider for Government Circle Rates.
 * Handles Haryana (Gurgaon/Gurugram) database queries, mapping, and averaging.
 */
import mongoose from 'mongoose';
import connectToDatabase from '../../../lib/db.js';
import { extractSector, parsePerSqftRate, average } from '../helpers.js';

export const name = 'Government Rate';
export const enabled = true;

// Municipal mapping of Gurgaon sectors to administrative Tehsils
const SECTOR_TO_TEHSIL_MAP = {
  Wazirabad: [30, 31, 38, 39, 40, 41, 42, 43, 44, 45, 46, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67],
  Badshahpur: [33, 34, 35, 36, 37, 47, 48, 49, 50, 51, 68, 69, 70, 71, 72, 73, 74, 75],
  Manesar: [76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95],
  Harsaru: [99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115],
  Gurugram: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
};

function getTehsilForSector(sectorNum) {
  if (!sectorNum) return null;
  const num = parseInt(sectorNum, 10);
  if (isNaN(num)) return null;
  
  for (const [tehsil, sectors] of Object.entries(SECTOR_TO_TEHSIL_MAP)) {
    if (sectors.includes(num)) {
      return tehsil.toLowerCase();
    }
  }
  return null;
}

function calculateSectorAverage(records) {
  if (!records || records.length === 0) return null;
  
  const unitGroups = {};
  records.forEach(rec => {
    const unit = rec.unit || 'INR_PER_SQ_YARD';
    if (!unitGroups[unit]) unitGroups[unit] = [];
    unitGroups[unit].push(rec.baseRate);
  });
  
  let bestUnit = 'INR_PER_SQ_YARD';
  let bestRates = [];
  
  for (const [unit, rates] of Object.entries(unitGroups)) {
    if (rates.length > bestRates.length || (unit === 'INR_PER_SQ_YARD' && rates.length === bestRates.length)) {
      bestUnit = unit;
      bestRates = rates;
    }
  }
  
  return {
    baseRate: average(bestRates),
    unit: bestUnit
  };
}

/**
 * Resolves circle rates for Haryana/Gurgaon.
 */
async function getHaryanaRate(property) {
  await connectToDatabase();
  const db = mongoose.connection.client.db('market_intelligence');
  
  const landUse = property.projectType === 'Commercial' ? 'Commercial' : 'Residential';
  const sectorNum = extractSector(property.locality || property.projectName);
  
  let baseRate = 0;
  let unit = 'INR_PER_SQ_YARD';
  let rateFound = false;

  // 1. Try Sector-Specific Match
  if (sectorNum) {
    const keyPattern = new RegExp(`(sec|sector)[-_\\s]*${sectorNum}(?!\\d)`, 'i');
    const records = await db.collection('haryana_rates').find({
      district: { $regex: /gurugram|gurgaon/i },
      landUse: landUse,
      $or: [
        { tehsilKey: { $regex: keyPattern } },
        { tehsil: { $regex: keyPattern } }
      ]
    }).toArray();
    
    if (records.length > 0) {
      const avgResult = calculateSectorAverage(records);
      if (avgResult) {
        baseRate = avgResult.baseRate;
        unit = avgResult.unit;
        rateFound = true;
      }
    }
  }

  // 2. Try Tehsil Fallback
  if (!rateFound) {
    const fallbackTehsil = getTehsilForSector(sectorNum) || 'gurugram';
    const summary = await db.collection('haryana_tehsil_summaries').findOne({
      district: { $regex: /gurugram|gurgaon/i },
      tehsilKey: fallbackTehsil
    });
    
    if (summary && summary.rates) {
      const rateObj = landUse === 'Commercial' ? summary.rates.commercial : summary.rates.residential;
      if (rateObj && rateObj.value) {
        baseRate = rateObj.value;
        unit = rateObj.unit || 'INR_PER_SQ_YARD';
        rateFound = true;
      }
    }
  }

  // 3. District Average Fallback
  if (!rateFound) {
    const allDistrictRates = await db.collection('haryana_rates').find({
      district: { $regex: /gurugram|gurgaon/i },
      landUse: landUse,
      unit: 'INR_PER_SQ_YARD'
    }).toArray();
    
    if (allDistrictRates.length > 0) {
      baseRate = average(allDistrictRates.map(r => r.baseRate));
      unit = 'INR_PER_SQ_YARD';
      rateFound = true;
    }
  }

  return parsePerSqftRate(baseRate, unit);
}

/**
 * Main entry point for Government rates lookup.
 */
export async function getRate(property) {
  const state = (property.state || '').toLowerCase().trim();
  const city = (property.city || '').toLowerCase().trim();
  
  if (state === 'haryana' || state === 'gurgaon' || state === 'gurugram' ||
      city === 'gurgaon' || city === 'gurugram') {
    return getHaryanaRate(property);
  }
  
  // Return null or fallback for other unconfigured states for V1
  return null;
}
