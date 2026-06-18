import connectToDatabase from '../../lib/db.js';
import ValuationHistory from '../../models/ValuationHistory.js';

/**
 * Saves a new valuation snapshot for a portfolio property if the valuation has changed.
 * @param {Object} portfolio - The portfolio Mongoose document or object
 * @param {Object} valuation - The newly calculated valuation metrics
 * @returns {Promise<Object|null>} - The created history document or null if skipped
 */
export async function saveValuationSnapshot(portfolio, valuation) {
  if (!portfolio || !valuation) {
    throw new Error('[saveValuationSnapshot] Portfolio and valuation objects are required.');
  }

  await connectToDatabase();

  const portfolioId = portfolio._id;
  const userId = portfolio.userId;

  if (!portfolioId || !userId) {
    throw new Error('[saveValuationSnapshot] Portfolio must have valid _id and userId fields.');
  }

  // Fetch the latest history record for this portfolio to compare
  const latestHistory = await ValuationHistory.findOne({ portfolioId })
    .sort({ _id: -1 })
    .lean();

  if (latestHistory) {
    const isUnchanged =
      latestHistory.valuation.currentMarketValue === valuation.currentMarketValue &&
      latestHistory.valuation.medianRate === valuation.medianRate;

    if (isUnchanged) {
      return null;
    }
  }

  // Save the new valuation snapshot
  const snapshot = await ValuationHistory.create({
    portfolioId,
    userId,
    valuation: {
      medianRate: Number(valuation.medianRate),
      currentMarketValue: Number(valuation.currentMarketValue),
      gain: Number(valuation.gain),
      gainPct: String(valuation.gainPct),
      projectRate: valuation.projectRate !== undefined && valuation.projectRate !== null ? Number(valuation.projectRate) : null,
      comparableRate: valuation.comparableRate !== undefined && valuation.comparableRate !== null ? Number(valuation.comparableRate) : null,
      governmentRate: valuation.governmentRate !== undefined && valuation.governmentRate !== null ? Number(valuation.governmentRate) : null,
    },
    calculatedAt: valuation.lastCalculatedAt || new Date(),
  });

  return snapshot;
}
