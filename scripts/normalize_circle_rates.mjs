import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables manually from .env
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

const MAX_SANITY_RATE_PER_SQFT = 500000; // Rs 5 Lakhs / sqft is the maximum reasonable rate in India

async function run() {
  try {
    const { default: connectToDatabase } = await import('../lib/db.js');
    const { default: CircleRate } = await import('../models/CircleRate.js');
    const { parsePerSqftRate } = await import('../services/valuation/helpers.js');

    await connectToDatabase();
    console.log("Connected to database.");

    const db = mongoose.connection.client.db('circle_rate');

    // 1. CLEAR EXISTING UNIFIED DATA to prevent duplicates on rerun
    console.log("Clearing existing unified circle rates...");
    await CircleRate.deleteMany({});
    console.log("Cleared.");

    // 2. MIGRATE DELHI RATES
    console.log("\nMigrating Delhi rates...");
    const dlRecords = await db.collection('circle_rate.dl').find({}).toArray();
    console.log(`Found ${dlRecords.length} Delhi records.`);

    let dlUpsertData = [];
    for (const rec of dlRecords) {
      if (!rec.colony || !rec.circleRate) continue;
      
      const originalRate = Number(rec.circleRate);
      const circleRate = Math.round(parsePerSqftRate(originalRate, 'INR_PER_SQM'));

      if (circleRate > MAX_SANITY_RATE_PER_SQFT) {
        console.warn(`[SANITY CHECK] Skipping corrupted rate for DL colony "${rec.colony}": Rs ${circleRate}/sqft`);
        continue;
      }

      dlUpsertData.push({
        stateCode: 'DL',
        district: 'Delhi',
        tehsil: rec.zoneName || '',
        locality: rec.colony.trim(),
        circleRate,
        unit: 'INR_PER_SQFT',
        originalRate,
        originalUnit: 'INR_PER_SQM',
        landUse: 'Residential'
      });
    }

    if (dlUpsertData.length > 0) {
      await CircleRate.insertMany(dlUpsertData);
      console.log(`Successfully migrated ${dlUpsertData.length} Delhi records.`);
    }

    // 3. MIGRATE HARYANA RATES
    console.log("\nMigrating Haryana rates...");
    const hrRecords = await db.collection('circle_rate.hr').find({}).toArray();
    console.log(`Found ${hrRecords.length} Haryana records.`);

    let hrUpsertData = [];
    for (const rec of hrRecords) {
      // Resolve name
      const localityName = rec.locality || rec.zone || rec.ward || rec.tehsil;
      if (!localityName) continue;

      // Resolve rate
      let originalRate = 0;
      if (rec.baseRate !== undefined && rec.baseRate !== null) {
        originalRate = rec.baseRate;
      } else if (rec.circleRate !== undefined && rec.circleRate !== null) {
        originalRate = rec.circleRate;
      } else if (rec.rate_max !== undefined && rec.rate_max !== null) {
        originalRate = (rec.rate_max + (rec.rate_min || rec.rate_max)) / 2;
      }

      if (!originalRate) continue;

      const originalUnit = rec.unit || 'INR_PER_SQ_YARD';
      const circleRate = Math.round(parsePerSqftRate(originalRate, originalUnit));

      if (circleRate > MAX_SANITY_RATE_PER_SQFT) {
        console.warn(`[SANITY CHECK] Skipping corrupted rate for HR locality "${localityName}": Rs ${circleRate}/sqft`);
        continue;
      }

      // Resolve landuse
      let landUse = 'Residential';
      const rawLandUse = (rec.landUse || rec.property_type || '').toLowerCase();
      if (rawLandUse.includes('commercial')) {
        landUse = 'Commercial';
      } else if (rawLandUse.includes('agri')) {
        landUse = 'Agricultural';
      }

      hrUpsertData.push({
        stateCode: 'HR',
        district: rec.district || 'Gurugram',
        tehsil: rec.tehsil || rec.tehsilEn || '',
        locality: localityName.trim(),
        circleRate,
        unit: 'INR_PER_SQFT',
        originalRate,
        originalUnit,
        landUse
      });
    }

    if (hrUpsertData.length > 0) {
      await CircleRate.insertMany(hrUpsertData);
      console.log(`Successfully migrated ${hrUpsertData.length} Haryana records.`);
    }

    // 4. MIGRATE UP RATES
    console.log("\nMigrating UP rates...");
    const upRecords = await db.collection('circle_rate.up').find({}).toArray();
    console.log(`Found ${upRecords.length} UP records.`);

    let upUpsertData = [];
    for (const rec of upRecords) {
      // Resolve locality name
      let localityName = '';
      if (rec.village) {
        localityName = typeof rec.village === 'object' 
          ? (rec.village.en || rec.village.hi || '') 
          : rec.village;
      } else if (rec.locality) {
        localityName = rec.locality;
      }
      
      if (!localityName) continue;

      // Resolve district name
      let districtName = '';
      if (rec.district) {
        districtName = typeof rec.district === 'object'
          ? (rec.district.en || rec.district.hi || '')
          : rec.district;
      }

      // Resolve tehsil/SRO name
      let tehsilName = '';
      if (rec.sro) {
        tehsilName = typeof rec.sro === 'object'
          ? (rec.sro.en || rec.sro.hi || '')
          : rec.sro;
      } else if (rec.tehsil) {
        tehsilName = rec.tehsil;
      }

      // Resolve rate
      let originalRate = rec.circleRate || rec.rate || 0;
      if (!originalRate) continue;

      const originalUnit = rec.rateUnit || 'INR_PER_SQM';
      const circleRate = Math.round(parsePerSqftRate(originalRate, originalUnit));

      if (circleRate > MAX_SANITY_RATE_PER_SQFT) {
        console.warn(`[SANITY CHECK] Skipping corrupted rate for UP locality "${localityName}": Rs ${circleRate}/sqft`);
        continue;
      }

      // Resolve landuse
      let landUse = 'Residential';
      const rawPropertyType = (rec.propertyType?.en || rec.propertyType?.hi || rec.propertyType || '').toLowerCase();
      if (rawPropertyType.includes('commercial') || rawPropertyType.includes('व्यवसायिक')) {
        landUse = 'Commercial';
      } else if (rawPropertyType.includes('agri') || rawPropertyType.includes('कृषि')) {
        landUse = 'Agricultural';
      }

      upUpsertData.push({
        stateCode: 'UP',
        district: districtName || 'Lucknow',
        tehsil: tehsilName,
        locality: localityName.trim(),
        circleRate,
        unit: 'INR_PER_SQFT',
        originalRate,
        originalUnit,
        landUse
      });
    }

    if (upUpsertData.length > 0) {
      await CircleRate.insertMany(upUpsertData);
      console.log(`Successfully migrated ${upUpsertData.length} UP records.`);
    }

    console.log("\nNormalization / Seed Completed Successfully!");
    
    // Output total count in the target collection
    const finalCount = await CircleRate.countDocuments({});
    console.log(`Total standardized records in 'circle_rates': ${finalCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Critical error in normalization script:", err);
    process.exit(1);
  }
}

run();
