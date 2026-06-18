/**
 * Core Orchestration & Math Calculator for Property Valuations.
 */
import * as projectRateProvider from './providers/projectRateProvider.js';
import * as comparableRateProvider from './providers/comparableRateProvider.js';
import * as governmentRateProvider from './providers/governmentRateProvider.js';
import { median, calculateGainLoss } from './helpers.js';

/**
 * Computes live valuation metrics for a property using active providers.
 */
export async function calculateValuationForProperty(property) {
  const purchasePrice = Number(property.totalPricePaid) || 10000000;
  const superArea = Number(property.superArea) || 2500;
  const purchaseRate = Math.round(purchasePrice / superArea);
  
  const providers = [
    projectRateProvider,
    comparableRateProvider,
    governmentRateProvider
  ];
  
  const results = await Promise.all(providers.map(async (p) => {
    try {
      const rate = await p.getRate(property);
      return rate;
    } catch (err) {
      console.error(`Error in provider ${p.name}:`, err.message);
      return null;
    }
  }));
  
  const projectRate = results[0];
  const comparableRate = results[1];
  const governmentRate = results[2];
  
  const validRates = results.filter(r => r !== null && r !== undefined && r > 0);
  
  let medianRate = 0;
  if (validRates.length > 0) {
    medianRate = Math.round(median(validRates));
  } else {
    // Fail-safe default
    medianRate = Math.round(purchaseRate * 1.05);
  }
  
  const currentMarketValue = medianRate * superArea;
  const { gain, gainPct } = calculateGainLoss(purchasePrice, currentMarketValue);
    
  return {
    price: purchasePrice,
    purchaseRate,
    medianRate,
    currentMarketValue,
    gain,
    gainPct,
    projectRate,
    comparableRate,
    governmentRate,
    lastCalculatedAt: new Date()
  };
}
