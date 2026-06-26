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

async function run() {
  try {
    const { default: connectToDatabase } = await import('../lib/db.js');
    const { default: Geometry } = await import('../models/Geometry.js');

    await connectToDatabase();
    console.log("Connected to database.");

    // --- 1. IMPORT STATE GEOMETRIES ---
    const statesPath = path.resolve(process.cwd(), 'data/INDIA_STATES.geojson');
    console.log(`\nReading official India States GeoJSON from local file: ${statesPath}...`);
    if (!fs.existsSync(statesPath)) {
      throw new Error(`Local file not found at ${statesPath}`);
    }
    const statesGeojson = JSON.parse(fs.readFileSync(statesPath, 'utf8'));
    console.log(`Read states data. Parsing features...`);

    const statesToInsert = [];
    const stateMapping = {
      'DELHI': { code: 'DL', name: 'Delhi' },
      'HARYANA': { code: 'HR', name: 'Haryana' },
      'UTTAR PRADESH': { code: 'UP', name: 'Uttar Pradesh' }
    };

    statesGeojson.features.forEach(f => {
      const rawName = (f.properties.STNAME || f.properties.ST_NM || f.properties.state || f.properties.NAME || '').toUpperCase().trim();
      const match = stateMapping[rawName];
      if (match) {
        statesToInsert.push({
          level: 'state',
          stateCode: match.code,
          name: match.name,
          geometry: {
            type: f.geometry.type,
            coordinates: f.geometry.coordinates
          }
        });
        console.log(` -> Matched State: ${match.name} (${match.code})`);
      }
    });

    if (statesToInsert.length > 0) {
      console.log(`Deleting old state geometries for DL, HR, UP...`);
      await Geometry.deleteMany({ level: 'state', stateCode: { $in: ['DL', 'HR', 'UP'] } });
      await Geometry.insertMany(statesToInsert);
      console.log(`Successfully imported ${statesToInsert.length} official state geometries!`);
    }

    // --- 2. IMPORT DISTRICT GEOMETRIES ---
    const districtsPath = path.resolve(process.cwd(), 'data/INDIA_DISTRICTS.geojson');
    console.log(`\nReading official India Districts GeoJSON from local file: ${districtsPath}...`);
    if (!fs.existsSync(districtsPath)) {
      throw new Error(`Local file not found at ${districtsPath}`);
    }
    const districtsGeojson = JSON.parse(fs.readFileSync(districtsPath, 'utf8'));
    console.log(`Read districts data. Parsing features...`);

    const districtsToInsert = [];
    const districtTargetMapping = {
      'GURGAON': { code: 'HR', standardName: 'Gurugram' },
      'GURUGRAM': { code: 'HR', standardName: 'Gurugram' },
      'FARIDABAD': { code: 'HR', standardName: 'Faridabad' },
      'LUCKNOW': { code: 'UP', standardName: 'Lucknow' },
      'GAUTAM BUDDHA NAGAR': { code: 'UP', standardName: 'Noida' }, // Noida is Gautam Buddha Nagar
      'G.B. NAGAR': { code: 'UP', standardName: 'Noida' },
      'GHAZIABAD': { code: 'UP', standardName: 'Ghaziabad' }
    };

    districtsGeojson.features.forEach(f => {
      const rawDistName = (f.properties.DISTRICT || f.properties.district || f.properties.NAME || '').toUpperCase().trim();
      const match = districtTargetMapping[rawDistName];
      if (match) {
        districtsToInsert.push({
          level: 'district',
          stateCode: match.code,
          name: match.standardName,
          geometry: {
            type: f.geometry.type,
            coordinates: f.geometry.coordinates
          }
        });
        console.log(` -> Matched District: ${match.standardName} (${match.code})`);
      }
    });

    if (districtsToInsert.length > 0) {
      console.log(`Deleting old district geometries...`);
      await Geometry.deleteMany({ level: 'district', stateCode: { $in: ['DL', 'HR', 'UP'] } });
      await Geometry.insertMany(districtsToInsert);
      console.log(`Successfully imported ${districtsToInsert.length} official district geometries!`);
    }

    console.log("\nOfficial Map Geometries Import Completed Successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Critical error in official geometries import:", err.message);
    process.exit(1);
  }
}

run();
