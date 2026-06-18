/**
 * Provider for Project Rate (Direct Catalog listing rate).
 */
import connectToDatabase from '../../../lib/db.js';
import MarketProject from '../../../models/MarketProject.js';
import { parsePerSqftRate } from '../helpers.js';

export const name = 'Project Rate';
export const enabled = true;

/**
 * Fetches the project-specific catalog listing rate per SqFt.
 */
export async function getRate(property) {
  if (!property.projectId) {
    return null;
  }
  
  await connectToDatabase();
  
  try {
    const project = await MarketProject.findById(property.projectId).lean();
    if (project && project.perSqftRate) {
      const rate = parsePerSqftRate(project.perSqftRate, 'INR_PER_SQ_FEET');
      return rate > 0 ? rate : null;
    }
  } catch (err) {
    console.error(`Error in projectRateProvider for projectId ${property.projectId}:`, err.message);
  }
  
  return null;
}
