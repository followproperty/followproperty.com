/**
 * Provider for Comparable Rate (Market comparables from other catalog builder projects in the same sector).
 */
import connectToDatabase from '../../../lib/db.js';
import MarketProject from '../../../models/MarketProject.js';
import { extractSector, parsePerSqftRate, average } from '../helpers.js';

export const name = 'Comparable Rate';
export const enabled = true;

/**
 * Calculates the average market rate per SqFt for comparable projects in the same sector.
 */
export async function getRate(property) {
  const sectorNum = extractSector(property.locality || property.projectName);
  if (!sectorNum) {
    return null;
  }
  
  await connectToDatabase();
  
  const landUse = property.projectType === 'Commercial' ? 'Commercial' : 'Residential';
  const sectorPattern = new RegExp(`(sec|sector)[-_\\s]*${sectorNum}(?!\\d)`, 'i');
  
  try {
    const projects = await MarketProject.find({
      city: { $regex: /gurgaon|gurugram/i },
      $or: [
        { locality: { $regex: sectorPattern } },
        { location: { $regex: sectorPattern } }
      ]
    }).select('perSqftRate propertyType').lean();
    
    const rates = projects
      .filter(p => {
        const type = (p.propertyType || '').toLowerCase();
        const rateIsComm = type.includes('comm') || type.includes('retail') || type.includes('office') || type.includes('shop');
        const rateIsRes = !rateIsComm;
        
        if (landUse === 'Commercial' && !rateIsComm) return false;
        if (landUse === 'Residential' && !rateIsRes) return false;
        return true;
      })
      .map(p => parsePerSqftRate(p.perSqftRate, 'INR_PER_SQ_FEET'))
      .filter(rate => rate > 0);
      
    if (rates.length > 0) {
      const avgRate = average(rates);
      return avgRate > 0 ? avgRate : null;
    }
  } catch (err) {
    console.error(`Error in comparableRateProvider:`, err.message);
  }
  
  return null;
}
