/**
 * Provider for Government Circle Rates.
 * Handles unified database queries for all states (HR, DL, UP) using CircleRate model.
 */
import connectToDatabase from '../../../lib/db.js';
import CircleRate from '../../../models/CircleRate.js';
import { extractSector, average } from '../helpers.js';

export const name = 'Government Rate';
export const enabled = true;

// Municipal mapping of Gurgaon sectors to administrative Tehsils (preserved for backward compatibility)
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

// Maps state/city input names to standard uppercase ISO codes
function resolveStateCode(stateName, cityName) {
  const s = (stateName || '').toLowerCase().trim();
  const c = (cityName || '').toLowerCase().trim();
  if (s === 'haryana' || s === 'gurgaon' || s === 'gurugram' || c === 'gurgaon' || c === 'gurugram') return 'HR';
  if (s === 'delhi' || c === 'delhi') return 'DL';
  if (s === 'uttar pradesh' || s === 'up' || c === 'lucknow' || c === 'noida' || c === 'ghaziabad') return 'UP';
  return null;
}

export async function getRate(property) {
  await connectToDatabase();

  const stateCode = resolveStateCode(property.state, property.city);
  if (!stateCode) return null;

  const landUse = property.projectType === 'Commercial' ? 'Commercial' : 'Residential';
  const district = property.city || property.district || '';
  const locality = property.locality || property.projectName || '';

  let rateFound = null;

  // 1. Try Locality / Sector-Specific Match
  if (stateCode === 'HR') {
    const sectorNum = extractSector(locality);
    if (sectorNum) {
      const sectorPattern = new RegExp(`(sec|sector)[-_\\s]*${sectorNum}(?!\\d)`, 'i');
      const records = await CircleRate.find({
        stateCode: 'HR',
        district: { $regex: /gurugram|gurgaon/i },
        landUse,
        $or: [
          { locality: { $regex: sectorPattern } },
          { tehsil: { $regex: sectorPattern } }
        ]
      });

      if (records.length > 0) {
        rateFound = average(records.map(r => r.circleRate));
      }
    }
  } else {
    // Delhi / UP exact or fuzzy locality matching
    const localityClean = locality.trim();
    if (localityClean) {
      const records = await CircleRate.find({
        stateCode,
        landUse,
        locality: { $regex: new RegExp(localityClean, 'i') }
      });
      if (records.length > 0) {
        rateFound = average(records.map(r => r.circleRate));
      }
    }
  }

  // 2. Haryana-Specific Tehsil Fallback
  if (rateFound === null && stateCode === 'HR') {
    const sectorNum = extractSector(locality);
    const fallbackTehsil = getTehsilForSector(sectorNum) || 'gurugram';
    const fallbackPattern = new RegExp(fallbackTehsil, 'i');

    const records = await CircleRate.find({
      stateCode: 'HR',
      district: { $regex: /gurugram|gurgaon/i },
      landUse,
      $or: [
        { tehsil: { $regex: fallbackPattern } }
      ]
    });

    if (records.length > 0) {
      rateFound = average(records.map(r => r.circleRate));
    }
  }

  // 3. District Average Fallback
  if (rateFound === null && district) {
    const records = await CircleRate.find({
      stateCode,
      district: { $regex: new RegExp(district, 'i') },
      landUse
    });
    if (records.length > 0) {
      rateFound = average(records.map(r => r.circleRate));
    }
  }

  // 4. State Average Fallback
  if (rateFound === null) {
    const records = await CircleRate.find({
      stateCode,
      landUse
    });
    if (records.length > 0) {
      rateFound = average(records.map(r => r.circleRate));
    }
  }

  return rateFound;
}
