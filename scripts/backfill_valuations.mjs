import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error(`Error: .env file not found at ${envPath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[match[1]] = val;
    }
  });
}

loadEnv();

async function run() {
  try {
    const { default: connectToDatabase } = await import('../lib/db.js');
    const { default: Portfolio } = await import('../models/Portfolio.js');
    const { calculateValuationForProperty } = await import('../services/valuation/valuationEngine.js');
    const { saveValuationSnapshot } = await import('../services/valuation/saveValuationSnapshot.js');

    await connectToDatabase();
    console.log("Database connected.\n");

    console.log("Fetching all portfolio documents...");
    const portfolios = await Portfolio.find({});
    console.log(`Found ${portfolios.length} total portfolios.\n`);

    let successCount = 0;
    let failCount = 0;

    for (const p of portfolios) {
      console.log(`Processing property ID: ${p._id} | Project: "${p.projectName}" | City: "${p.city}"...`);
      try {
        const valuation = await calculateValuationForProperty(p);
        
        // Save the valuation snapshot back to the document
        p.valuation = valuation;
        await p.save();

        // Save explicit snapshot to ValuationHistory
        const snapshot = await saveValuationSnapshot(p, valuation);
        if (snapshot) {
          console.log(`  -> Saved new history record: ID = ${snapshot._id}`);
        } else {
          console.log(`  -> Valuation unchanged. History entry skipped.`);
        }
        
        console.log(`  -> Successfully updated valuation: Current Value = ₹${(valuation.currentMarketValue).toLocaleString()}, Median Rate = ₹${valuation.medianRate}/sqft`);
        successCount++;
      } catch (err) {
        console.error(`  -> Failed to update property ${p._id}:`, err.message);
        failCount++;
      }
    }

    console.log("\n--- BACKFILL COMPLETED ---");
    console.log(`Success: ${successCount}`);
    console.log(`Failed:  ${failCount}`);
    console.log("--------------------------\n");

    process.exit(0);
  } catch (err) {
    console.error("Critical error in backfill script:", err);
    process.exit(1);
  }
}

run();
