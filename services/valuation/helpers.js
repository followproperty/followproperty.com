/**
 * Shared stateless utility helpers for property valuation.
 */

export const CONVERSION_FACTORS = {
  SQ_YARD_TO_SQ_FT: 9,
  SQM_TO_SQ_FT: 10.7639,
  ACRE_TO_SQ_FT: 43560
};

/**
 * Extracts a numeric sector number from locality or project name.
 */
export function extractSector(text) {
  if (!text) return null;
  const match = text.match(/(?:sector|sec)\s*[-_]?\s*(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Converts a raw base rate from a specified unit into rate per Square Foot.
 */
export function convertRateToSqFt(rate, unit) {
  if (!rate || isNaN(rate)) return 0;
  const normalizedUnit = (unit || '').toUpperCase().trim();
  switch (normalizedUnit) {
    case 'INR_PER_SQ_FEET':
    case 'INR_PER_SQFT':
      return rate;
    case 'INR_PER_SQ_YARD':
    case 'INR_PER_SQYARD':
      return rate / CONVERSION_FACTORS.SQ_YARD_TO_SQ_FT;
    case 'INR_PER_SQM':
    case 'INR_PER_SQ_METER':
      return rate / CONVERSION_FACTORS.SQM_TO_SQ_FT;
    case 'INR_PER_ACRE':
      return rate / CONVERSION_FACTORS.ACRE_TO_SQ_FT;
    default:
      return rate;
  }
}

/**
 * Parses raw rate input to normal float rate per SqFt.
 */
export function parsePerSqftRate(baseRate, unit) {
  if (baseRate === null || baseRate === undefined) return 0;
  let cleanRate = 0;
  if (typeof baseRate === 'string') {
    if (baseRate.includes('-')) {
      const parts = baseRate.split('-');
      const parsedParts = parts.map(part => {
        let isK = /k/i.test(part);
        let numStr = part.replace(/[^0-9.]/g, '');
        let num = parseFloat(numStr);
        if (isNaN(num)) return 0;
        if (isK) {
          return num * 1000;
        }
        return num;
      }).filter(n => n > 0);
      
      if (parsedParts.length > 0) {
        cleanRate = parsedParts.reduce((a, b) => a + b, 0) / parsedParts.length;
      }
    } else {
      let isK = /k/i.test(baseRate);
      let numStr = baseRate.replace(/[^0-9.]/g, '');
      let num = parseFloat(numStr);
      if (!isNaN(num)) {
        cleanRate = isK ? num * 1000 : num;
      }
    }
  } else if (typeof baseRate === 'number') {
    cleanRate = baseRate;
  }
  if (isNaN(cleanRate)) return 0;
  return convertRateToSqFt(cleanRate, unit);
}

/**
 * Calculates the median of an array of numbers.
 */
export function median(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  } else {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
}

/**
 * Calculates the average of an array of numbers.
 */
export function average(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}

/**
 * Calculates gain/loss and appreciation percentage.
 */
export function calculateGainLoss(purchasePrice, currentMarketValue) {
  const purchase = Number(purchasePrice) || 0;
  const current = Number(currentMarketValue) || 0;
  const gain = current - purchase;
  const gainPct = purchase > 0 ? ((gain / purchase) * 100).toFixed(1) : "0.0";
  return { gain, gainPct };
}
